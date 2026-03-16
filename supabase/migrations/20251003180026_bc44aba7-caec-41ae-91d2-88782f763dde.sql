-- Dodaj tabelę strategii marketingowych
CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_audience JSONB DEFAULT '{}',
  goals JSONB DEFAULT '[]',
  swot_analysis JSONB DEFAULT '{"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}',
  competitor_analysis JSONB DEFAULT '[]',
  budget_allocation JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '{}',
  kpis JSONB DEFAULT '[]',
  generated_content TEXT,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela biblioteki treści
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'video', 'audio', 'social_post', 'blog_article', 'email', 'ad_copy')),
  channel TEXT CHECK (channel IN ('facebook', 'instagram', 'tiktok', 'linkedin', 'twitter', 'email', 'blog', 'youtube', 'website')),
  content_text TEXT,
  media_url TEXT,
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  prompt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela kontaktów PR i influencerów
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  contact_type TEXT CHECK (contact_type IN ('journalist', 'influencer', 'blogger', 'media', 'partner', 'client', 'other')),
  social_media JSONB DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_contact_date DATE,
  interaction_history JSONB DEFAULT '[]',
  audience_size INTEGER,
  engagement_rate DECIMAL(5,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela kalendarza publikacji
CREATE TABLE public.publication_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  auto_publish BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla strategies
CREATE POLICY "Users can view their own strategies" 
  ON public.strategies FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" 
  ON public.strategies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
  ON public.strategies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
  ON public.strategies FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies dla content_library
CREATE POLICY "Users can view their own content" 
  ON public.content_library FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content" 
  ON public.content_library FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" 
  ON public.content_library FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" 
  ON public.content_library FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies dla contacts
CREATE POLICY "Users can view their own contacts" 
  ON public.contacts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
  ON public.contacts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON public.contacts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON public.contacts FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies dla publication_calendar
CREATE POLICY "Users can view their own publications" 
  ON public.publication_calendar FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publications" 
  ON public.publication_calendar FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publications" 
  ON public.publication_calendar FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own publications" 
  ON public.publication_calendar FOR DELETE 
  USING (auth.uid() = user_id);

-- Triggers dla updated_at
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publication_calendar_updated_at
  BEFORE UPDATE ON public.publication_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();