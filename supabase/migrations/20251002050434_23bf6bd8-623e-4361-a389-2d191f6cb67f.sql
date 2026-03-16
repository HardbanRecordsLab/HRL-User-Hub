-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('artist', 'label', 'admin', 'user');

-- Create project status enum
CREATE TYPE project_status AS ENUM ('draft', 'pending', 'published', 'archived');

-- Create campaign status enum  
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'artist',
  artist_name TEXT,
  label_name TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Music releases table
CREATE TABLE public.music_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_type TEXT CHECK (album_type IN ('single', 'ep', 'album', 'compilation')),
  release_date DATE,
  cover_image_url TEXT,
  description TEXT,
  genre TEXT[],
  metadata JSONB DEFAULT '{}',
  isrc_codes JSONB DEFAULT '{}',
  upc_code TEXT,
  status project_status DEFAULT 'draft',
  distribution_platforms JSONB DEFAULT '[]',
  streaming_stats JSONB DEFAULT '{}',
  revenue_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital publications table
CREATE TABLE public.digital_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  publication_type TEXT CHECK (publication_type IN ('ebook', 'audiobook', 'article', 'course')),
  isbn TEXT,
  description TEXT,
  cover_image_url TEXT,
  content_url TEXT,
  metadata JSONB DEFAULT '{}',
  status project_status DEFAULT 'draft',
  distribution_channels JSONB DEFAULT '[]',
  sales_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('social', 'email', 'pr', 'paid_ads', 'influencer', 'mixed')),
  target_audience JSONB DEFAULT '{}',
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  status campaign_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  goals JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  channels JSONB DEFAULT '[]',
  ai_suggestions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated content table
CREATE TABLE public.ai_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'audio', 'video', 'strategy')),
  prompt TEXT NOT NULL,
  generated_content TEXT,
  metadata JSONB DEFAULT '{}',
  usage_stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for music releases
CREATE POLICY "Users can view their own music releases" 
  ON public.music_releases FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own music releases" 
  ON public.music_releases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music releases" 
  ON public.music_releases FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music releases" 
  ON public.music_releases FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for digital publications
CREATE POLICY "Users can view their own publications" 
  ON public.digital_publications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publications" 
  ON public.digital_publications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publications" 
  ON public.digital_publications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own publications" 
  ON public.digital_publications FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for marketing campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.marketing_campaigns FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.marketing_campaigns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.marketing_campaigns FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.marketing_campaigns FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for AI content
CREATE POLICY "Users can view their own AI content" 
  ON public.ai_content FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI content" 
  ON public.ai_content FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI content" 
  ON public.ai_content FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for analytics events
CREATE POLICY "Users can view their own analytics" 
  ON public.analytics_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" 
  ON public.analytics_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_music_releases_updated_at
  BEFORE UPDATE ON public.music_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_digital_publications_updated_at
  BEFORE UPDATE ON public.digital_publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();