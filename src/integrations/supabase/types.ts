export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_content: {
        Row: {
          content_type: string | null
          created_at: string | null
          generated_content: string | null
          id: string
          metadata: Json | null
          prompt: string
          usage_stats: Json | null
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          generated_content?: string | null
          id?: string
          metadata?: Json | null
          prompt: string
          usage_stats?: Json | null
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          generated_content?: string | null
          id?: string
          metadata?: Json | null
          prompt?: string
          usage_stats?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_integrations: {
        Row: {
          api_category: string
          api_key_stored: boolean | null
          api_name: string
          config: Json | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_used_at: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          api_category: string
          api_key_stored?: boolean | null
          api_name: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          api_category?: string
          api_key_stored?: boolean | null
          api_name?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: Json | null
          created_at: string | null
          description: string | null
          executions_count: number | null
          id: string
          last_run_at: string | null
          name: string
          status: string
          success_rate: number | null
          triggers: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          executions_count?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          status?: string
          success_rate?: number | null
          triggers?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          executions_count?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          status?: string
          success_rate?: number | null
          triggers?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          audience_size: number | null
          categories: string[] | null
          company: string | null
          contact_type: string | null
          created_at: string | null
          email: string | null
          engagement_rate: number | null
          id: string
          interaction_history: Json | null
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          rating: number | null
          social_media: Json | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audience_size?: number | null
          categories?: string[] | null
          company?: string | null
          contact_type?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          id?: string
          interaction_history?: Json | null
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          social_media?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audience_size?: number | null
          categories?: string[] | null
          company?: string | null
          contact_type?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          id?: string
          interaction_history?: Json | null
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          social_media?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          ai_generated: boolean | null
          campaign_id: string | null
          channel: string | null
          content_text: string | null
          content_type: string | null
          created_at: string | null
          id: string
          media_url: string | null
          metadata: Json | null
          performance_metrics: Json | null
          prompt: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          campaign_id?: string | null
          channel?: string | null
          content_text?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          metadata?: Json | null
          performance_metrics?: Json | null
          prompt?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          campaign_id?: string | null
          channel?: string | null
          content_text?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          metadata?: Json | null
          performance_metrics?: Json | null
          prompt?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_publications: {
        Row: {
          author_name: string
          content_url: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          distribution_channels: Json | null
          id: string
          isbn: string | null
          metadata: Json | null
          publication_type: string | null
          sales_data: Json | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author_name: string
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          distribution_channels?: Json | null
          id?: string
          isbn?: string | null
          metadata?: Json | null
          publication_type?: string | null
          sales_data?: Json | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author_name?: string
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          distribution_channels?: Json | null
          id?: string
          isbn?: string | null
          metadata?: Json | null
          publication_type?: string | null
          sales_data?: Json | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_publications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_releases: {
        Row: {
          artist_name: string
          created_at: string | null
          genre: string | null
          id: string
          music_release_id: string | null
          platforms: Json | null
          release_date: string | null
          revenue: number | null
          routenote_package_url: string | null
          status: string
          streams_count: number | null
          submitted_at: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist_name: string
          created_at?: string | null
          genre?: string | null
          id?: string
          music_release_id?: string | null
          platforms?: Json | null
          release_date?: string | null
          revenue?: number | null
          routenote_package_url?: string | null
          status?: string
          streams_count?: number | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist_name?: string
          created_at?: string | null
          genre?: string | null
          id?: string
          music_release_id?: string | null
          platforms?: Json | null
          release_date?: string | null
          revenue?: number | null
          routenote_package_url?: string | null
          status?: string
          streams_count?: number | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_releases_music_release_id_fkey"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_releases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journalists: {
        Row: {
          created_at: string | null
          email: string
          engagement_level: string | null
          id: string
          last_contacted_at: string | null
          name: string
          notes: string | null
          outlet: string | null
          topics: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          engagement_level?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          outlet?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          engagement_level?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          outlet?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journalists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          ai_suggestions: Json | null
          budget: number | null
          campaign_type: string | null
          channels: Json | null
          created_at: string | null
          description: string | null
          end_date: string | null
          goals: Json | null
          id: string
          metrics: Json | null
          name: string
          spent: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          budget?: number | null
          campaign_type?: string | null
          channels?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          metrics?: Json | null
          name: string
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          budget?: number | null
          campaign_type?: string | null
          channels?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          metrics?: Json | null
          name?: string
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_releases: {
        Row: {
          additional_files: Json | null
          admin_notes: string | null
          album_type: string | null
          artist_name: string
          audio_file_url: string | null
          cover_file_url: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          distribution_platforms: Json | null
          genre: string[] | null
          id: string
          isrc_codes: Json | null
          metadata: Json | null
          release_date: string | null
          revenue_data: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["release_status"] | null
          streaming_stats: Json | null
          submitted_at: string | null
          title: string
          upc_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_files?: Json | null
          admin_notes?: string | null
          album_type?: string | null
          artist_name: string
          audio_file_url?: string | null
          cover_file_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          distribution_platforms?: Json | null
          genre?: string[] | null
          id?: string
          isrc_codes?: Json | null
          metadata?: Json | null
          release_date?: string | null
          revenue_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["release_status"] | null
          streaming_stats?: Json | null
          submitted_at?: string | null
          title: string
          upc_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_files?: Json | null
          admin_notes?: string | null
          album_type?: string | null
          artist_name?: string
          audio_file_url?: string | null
          cover_file_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          distribution_platforms?: Json | null
          genre?: string[] | null
          id?: string
          isrc_codes?: Json | null
          metadata?: Json | null
          release_date?: string | null
          revenue_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["release_status"] | null
          streaming_stats?: Json | null
          submitted_at?: string | null
          title?: string
          upc_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_releases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          audio_url: string | null
          created_at: string | null
          description: string | null
          downloads: number | null
          duration: string | null
          id: string
          metadata: Json | null
          platform: string | null
          publish_date: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          duration?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          publish_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          duration?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          publish_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      press_releases: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          opens_count: number | null
          published_at: string | null
          recipients_count: number | null
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          opens_count?: number | null
          published_at?: string | null
          recipients_count?: number | null
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          opens_count?: number | null
          published_at?: string | null
          recipients_count?: number | null
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "press_releases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          label_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          label_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          label_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      publication_calendar: {
        Row: {
          auto_publish: boolean | null
          campaign_id: string | null
          channel: string
          content_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          notification_sent: boolean | null
          scheduled_date: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_publish?: boolean | null
          campaign_id?: string | null
          channel: string
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          scheduled_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_publish?: boolean | null
          campaign_id?: string | null
          channel?: string
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          scheduled_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_calendar_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_calendar_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_calendar_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          source: string
          source_id: string | null
          transaction_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source: string
          source_id?: string | null
          transaction_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          source_id?: string | null
          transaction_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          budget_allocation: Json | null
          competitor_analysis: Json | null
          created_at: string | null
          description: string | null
          generated_content: string | null
          goals: Json | null
          id: string
          kpis: Json | null
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          swot_analysis: Json | null
          target_audience: Json | null
          timeline: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_allocation?: Json | null
          competitor_analysis?: Json | null
          created_at?: string | null
          description?: string | null
          generated_content?: string | null
          goals?: Json | null
          id?: string
          kpis?: Json | null
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          swot_analysis?: Json | null
          target_audience?: Json | null
          timeline?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_allocation?: Json | null
          competitor_analysis?: Json | null
          created_at?: string | null
          description?: string | null
          generated_content?: string | null
          goals?: Json | null
          id?: string
          kpis?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          swot_analysis?: Json | null
          target_audience?: Json | null
          timeline?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "artist" | "label"
      campaign_status: "draft" | "active" | "paused" | "completed" | "archived"
      project_status: "draft" | "pending" | "published" | "archived"
      release_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "published"
        | "rejected"
      user_role: "artist" | "label" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "artist", "label"],
      campaign_status: ["draft", "active", "paused", "completed", "archived"],
      project_status: ["draft", "pending", "published", "archived"],
      release_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "published",
        "rejected",
      ],
      user_role: ["artist", "label", "admin", "user"],
    },
  },
} as const
