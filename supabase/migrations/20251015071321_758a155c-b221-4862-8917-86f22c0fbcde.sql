-- Fix critical privilege escalation vulnerability by implementing proper role system

-- 1. Create app_role enum for the new user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'artist', 'label');

-- 2. Create separate user_roles table (NOT on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles - users can only view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: No INSERT/UPDATE/DELETE policies - only admins can modify roles via security definer functions

-- 5. Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Create security definer function for admins to assign roles
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Insert the role (ON CONFLICT DO NOTHING to handle duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 7. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::public.app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Update profiles UPDATE policy to prevent role modification
-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new UPDATE policy that excludes the role column
CREATE POLICY "Users can update their own profile (except role)"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    -- Prevent role changes by checking the role hasn't changed
    AND (
      role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 9. Add helpful comment
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles to prevent privilege escalation. Only admins can modify roles via assign_user_role() function.';
COMMENT ON FUNCTION public.has_role(UUID, public.app_role) IS 'Security definer function to check if a user has a specific role. Use in RLS policies to avoid recursion.';
COMMENT ON FUNCTION public.assign_user_role(UUID, public.app_role) IS 'Security definer function for admins to assign roles to users. Only callable by users with admin role.';