import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long (max 10000 characters)").trim(),
  contentType: z.enum(["social_post", "blog_article", "email", "ad_copy"]).default("social_post"),
  channel: z.enum(["instagram", "facebook", "linkedin", "twitter", "tiktok", "email", "blog"]).default("instagram"),
  generateImage: z.boolean().default(false)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract user from JWT for attribution
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Brak autoryzacji" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    ).auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowa autoryzacja" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const body = await req.json();
    const validation = inputSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { prompt, contentType, channel, generateImage } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    switch (contentType) {
      case "social_post":
        systemPrompt = "Jesteś ekspertem od social media. Tworzysz angażujące posty z odpowiednimi hashtagami i emoji. Dostosowujesz styl do platformy.";
        break;
      case "blog_article":
        systemPrompt = "Jesteś copywriterem specjalizującym się w artykułach blogowych. Tworzysz wartościowe, SEO-friendly treści z nagłówkami i strukturą.";
        break;
      case "email":
        systemPrompt = "Jesteś ekspertem email marketingu. Tworzysz przekonujące emaile z jasnym CTA i personalizacją.";
        break;
      case "ad_copy":
        systemPrompt = "Jesteś copywriterem reklamowym. Tworzysz krótkie, przekonujące teksty reklamowe z silnym przekazem i CTA.";
        break;
      default:
        systemPrompt = "Jesteś kreatywnym copywriterem. Tworzysz wysokiej jakości treści marketingowe.";
    }

    systemPrompt += ` Odpowiadaj po polsku. ${channel ? `Treść ma być dostosowana do platformy: ${channel}` : ''}`;

    // Generate text content
    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!textResponse.ok) {
      throw new Error("Error generating text content");
    }

    const textData = await textResponse.json();
    const generatedText = textData.choices?.[0]?.message?.content || "";

    let imageUrl = null;

    // Generate image if requested
    if (generateImage) {
      const imagePrompt = `Create a high-quality, professional marketing image for: ${prompt}. Ultra high resolution, professional photography style.`;
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      }
    }

    return new Response(
      JSON.stringify({ 
        content: generatedText,
        imageUrl: imageUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content:", error);
    const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas generowania treści";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});