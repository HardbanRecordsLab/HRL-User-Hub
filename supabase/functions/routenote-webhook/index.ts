import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3'

/**
 * Webhook przyjmujący aktualizacje statusów dystrybucji (RouteNote i inne).
 * Autoryzacja: nagłówek `x-hrl-signature` musi być równy ROUTENOTE_WEBHOOK_SECRET.
 */

const EventSchema = z.object({
  upc: z.string().min(1).max(64).optional(),
  isrc: z.string().min(1).max(64).optional(),
  release_id: z.string().uuid().optional(),
  publication_id: z.string().uuid().optional(),
  title: z.string().max(500).optional(),
  platform: z.string().min(1).max(120),
  status: z.string().min(1).max(60),
  url: z.string().url().max(1000).optional(),
  external_id: z.string().max(200).optional(),
  reported_at: z.string().max(60).optional(),
})

const BodySchema = z.object({
  events: z.array(EventSchema).min(1).max(500),
})

const STATUS_MAP: Record<string, string> = {
  pending: 'pending_review', 'pending review': 'pending_review',
  processing: 'under_review', review: 'under_review', 'in review': 'under_review',
  approved: 'approved', accepted: 'approved',
  delivered: 'distributed', distributed: 'distributed', sent: 'distributed',
  live: 'live', published: 'live', available: 'live',
  takedown: 'rejected', rejected: 'rejected', failed: 'rejected',
}

const RANK: Record<string, number> = {
  draft: 0, submitted: 1, pending_review: 2, under_review: 3,
  approved: 4, distributed: 5, published: 6, live: 7,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = Deno.env.get('ROUTENOTE_WEBHOOK_SECRET')
  if (!secret || req.headers.get('x-hrl-signature') !== secret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let inserted = 0
  const unmatched: string[] = []
  const touched = new Map<string, { userId: string; statuses: string[] }>()

  for (const e of parsed.data.events) {
    let releaseId: string | null = e.release_id ?? null
    let publicationId: string | null = e.publication_id ?? null
    let userId: string | null = null

    if (releaseId) {
      const { data } = await supabase.from('music_releases').select('id, user_id').eq('id', releaseId).maybeSingle()
      userId = data?.user_id ?? null
      if (!data) releaseId = null
    }
    if (!releaseId && !publicationId && e.upc) {
      const { data } = await supabase.from('music_releases').select('id, user_id').eq('upc_code', e.upc).maybeSingle()
      if (data) { releaseId = data.id; userId = data.user_id }
    }
    if (!releaseId && !publicationId && e.title) {
      const { data } = await supabase.from('music_releases').select('id, user_id').eq('title', e.title).maybeSingle()
      if (data) { releaseId = data.id; userId = data.user_id }
    }
    if (publicationId && !userId) {
      const { data } = await supabase.from('digital_publications').select('id, user_id').eq('id', publicationId).maybeSingle()
      userId = data?.user_id ?? null
      if (!data) publicationId = null
    }

    if (!userId || (!releaseId && !publicationId)) {
      unmatched.push(e.upc || e.title || e.external_id || 'unknown')
      continue
    }

    const mapped = STATUS_MAP[e.status.trim().toLowerCase()] ?? e.status.trim().toLowerCase()

    const { error } = await supabase.from('distribution_events').insert({
      user_id: userId,
      release_id: releaseId,
      publication_id: publicationId,
      platform: e.platform,
      status: mapped,
      url: e.url ?? null,
      external_id: e.external_id ?? null,
      source: 'webhook',
      reported_at: e.reported_at ? new Date(e.reported_at).toISOString() : new Date().toISOString(),
      payload: e as unknown as Record<string, unknown>,
    })
    if (error) continue
    inserted++

    if (releaseId) {
      const entry = touched.get(releaseId) ?? { userId, statuses: [] }
      entry.statuses.push(mapped)
      touched.set(releaseId, entry)
    }
  }

  // Aktualizacja statusu wydania na najwyższy osiągnięty
  for (const [releaseId, { userId, statuses }] of touched) {
    const valid = statuses.filter((s) => RANK[s] !== undefined)
    const best = valid.length
      ? valid.reduce((a, b) => (RANK[b] > RANK[a] ? b : a))
      : statuses.includes('rejected') ? 'rejected' : null
    if (!best) continue

    const { data: current } = await supabase.from('music_releases').select('status').eq('id', releaseId).maybeSingle()
    const currentRank = current?.status ? RANK[current.status] ?? -1 : -1
    if (best !== 'rejected' && currentRank >= (RANK[best] ?? -1)) continue

    await supabase.from('music_releases').update({ status: best }).eq('id', releaseId)
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Aktualizacja dystrybucji',
      message: `Status Twojego wydania zmieniono na: ${best}.`,
      type: best === 'rejected' ? 'warning' : 'success',
      category: 'distribution',
      is_read: false,
    })
  }

  return new Response(JSON.stringify({ ok: true, inserted, unmatched }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
