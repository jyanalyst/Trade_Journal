import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A real client only when both env vars are present AND look like real values
// (not the placeholder strings shipped in .env.example). Otherwise null →
// the component silently falls back to in-memory state.
const isConfigured =
  !!url &&
  !!key &&
  !url.includes("your-project-ref") &&
  !key.includes("your-anon-public-key");

export const supabase = isConfigured ? createClient(url, key) : null;

// ── Field mapping: JS camelCase ⇆ DB snake_case ─────────────────────────────
// `gates` is a JSONB column — Supabase stores/returns it as a plain object,
// so no JSON.parse / JSON.stringify is needed.

// JS idea → DB row
export function ideaToRow(idea) {
  return {
    id:              String(idea.id), // PK is text; v5 generates a numeric id
    date:            idea.date,
    kill_zone:       idea.killZone,
    created_at:      idea.createdAt,
    updated_at:      idea.updatedAt,
    status:          idea.status,
    ticker:          idea.ticker,
    direction:       idea.direction,
    catalyst:        idea.catalyst,
    signal_1hr:      idea.signal1hr,
    lower_tf_signal: idea.lowerTfSignal,
    poc_confirm:     idea.pocConfirm,
    entry:           idea.entry,
    stop:            idea.stop,
    weekly_ctx:      idea.weeklyCtx,
    daily_ctx:       idea.dailyCtx,
    mthly_ctx:       idea.mthlyCtx,
    gates:           idea.gates,
    risk_factors:    idea.riskFactors,
    observation:     idea.observation,
    executed_at:     idea.executedAt,
    exit_price:      idea.exitPrice,
    crt_bias:        idea.crtBias,
    daily_candle:    idea.dailyCandle,
  };
}

// DB row → JS idea
export function rowToIdea(row) {
  return {
    id:            row.id,
    date:          row.date,
    killZone:      row.kill_zone,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
    status:        row.status,
    ticker:        row.ticker,
    direction:     row.direction,
    catalyst:      row.catalyst,
    signal1hr:     row.signal_1hr,
    lowerTfSignal: row.lower_tf_signal,
    pocConfirm:    row.poc_confirm,
    entry:         row.entry,
    stop:          row.stop,
    weeklyCtx:     row.weekly_ctx,
    dailyCtx:      row.daily_ctx,
    mthlyCtx:      row.mthly_ctx,
    gates:         row.gates,
    riskFactors:   row.risk_factors || { pwhl:false, orb:false },
    observation:   row.observation,
    executedAt:    row.executed_at,
    exitPrice:     row.exit_price || "",
    crtBias:       row.crt_bias || null,
    dailyCandle:   row.daily_candle || null,
  };
}
