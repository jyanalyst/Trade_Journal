'use client';

import { useState, useEffect, useRef } from "react";
import { supabase, ideaToRow, rowToIdea } from "../lib/supabase";

const C = {
  bg:        "#080c14",
  surface:   "#0e1520",
  elevated:  "#141e2e",
  border:    "#1e2d45",
  amber:     "#f0a500",
  amberDim:  "rgba(240,165,0,0.12)",
  green:     "#00c076",
  greenDim:  "rgba(0,192,118,0.12)",
  red:       "#ff4d6a",
  redDim:    "rgba(255,77,106,0.12)",
  blue:      "#4d9fff",
  blueDim:   "rgba(77,159,255,0.10)",
  orange:    "#ff8c42",
  orangeDim: "rgba(255,140,66,0.12)",
  cyan:      "#00d4ff",
  purple:    "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
  text:      "#dce8f5",
  textMid:   "#6b8aaa",
  textDim:   "#344d66",
  white:     "#ffffff",
};

// ── Phase vocabulary from 1hr_Signal_DashBoard.py ────────────────────────────
// manipulation → T-0 | expansion_1 → T-1 | … | expansion_4 → T-4
// expired | invalidated | none
const PHASES = [
  { value: "",             label: "— select —" },
  { value: "manipulation", label: "T-0  Manipulation" },
  { value: "expansion_1",  label: "T-1  Expansion 1"  },
  { value: "expansion_2",  label: "T-2  Expansion 2"  },
  { value: "expansion_3",  label: "T-3  Expansion 3"  },
  { value: "expansion_4",  label: "T-4  Expansion 4"  },
  { value: "expired",      label: "Expired"            },
  { value: "invalidated",  label: "Invalidated"        },
  { value: "none",         label: "None"               },
];

// Colour + short label per phase for card badges
function phaseStyle(val) {
  if (!val) return { color: C.textDim, bg: "transparent", border: C.border, short: "—" };
  const map = {
    manipulation: { color: C.red,    bg: C.redDim,    border:`${C.red}44`,    short:"T-0" },
    expansion_1:  { color: C.green,  bg: C.greenDim,  border:`${C.green}44`,  short:"T-1" },
    expansion_2:  { color: C.green,  bg: C.greenDim,  border:`${C.green}44`,  short:"T-2" },
    expansion_3:  { color: C.amber,  bg: C.amberDim,  border:`${C.amber}44`,  short:"T-3" },
    expansion_4:  { color: C.amber,  bg: C.amberDim,  border:`${C.amber}44`,  short:"T-4" },
    expired:      { color: C.textDim,bg:"transparent", border:C.border,       short:"Exp" },
    invalidated:  { color: C.red,    bg: C.redDim,    border:`${C.red}44`,    short:"Inv" },
    none:         { color: C.textDim,bg:"transparent", border:C.border,       short:"—"   },
  };
  return map[val] || { color:C.textDim, bg:"transparent", border:C.border, short:"?" };
}

const KILL_ZONES = [
  { id:"opening", label:"Opening", time:"08:30" },
  { id:"kz1000",  label:"1000",   time:"10:00" },
  { id:"kz1100",  label:"1100",   time:"11:00" },
  { id:"kz1300",  label:"1300",   time:"13:00" },
  { id:"kz1400",  label:"1400",   time:"14:00" },
  { id:"kz1500",  label:"1500",   time:"15:00" },
  { id:"kz1600",  label:"1600",   time:"16:00" },
  { id:"kz1700",  label:"1700",   time:"17:00" },
];

const mono = { fontFamily:"'DM Mono',monospace" };
const sans = { fontFamily:"'IBM Plex Sans',sans-serif" };

function todayISO() { return new Date().toISOString().slice(0,10); }

function calcSize(risk, entry, stop) {
  const r = parseFloat(risk), e = parseFloat(entry), s = parseFloat(stop);
  if (!r || !e || !s || e === s) return null;
  const diff = Math.abs(e - s);
  const lots = Math.floor(r / diff / 1000);
  return { lots, shares: lots * 1000, rPerShare: diff };
}

function newIdea(killZone) {
  return {
    id: Date.now() + Math.random(),
    date: todayISO(),
    killZone,
    createdAt: new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"}),
    updatedAt: null,
    status: "watching",
    ticker: "",
    direction: "long",
    catalyst: false,
    signal1hr: null,
    lowerTfSignal: null,
    pocConfirm: null,
    entry: "",
    stop: "",
    weeklyCtx:  "",   // phase value
    dailyCtx:   "",   // phase value
    mthlyCtx:   "",   // phase value
    gates: { G1:false, G2:false, G3:false, G4:false },
    riskFactors: { pwhl:false, orb:false },
    observation: "",
    executedAt: null,
  };
}

// ── Action items for failed criteria ─────────────────────────────────────────
function getActionItems(idea) {
  const items = [];
  if (idea.signal1hr === false) {
    const tf = idea.lowerTfSignal;
    items.push({
      key: "1hr",
      label: tf ? `${tf} Signal confirmed` : "No 1hr Signal",
      action: tf ? null : "Check 15m / 30m Signal",
      color: tf ? C.orange : C.red,
      resolved: !!tf,
    });
  }
  if (idea.pocConfirm === false) {
    items.push({
      key: "poc",
      label: "No POC",
      action: "Set Markers — Wait for POC or 5m Signal",
      color: C.red,
      resolved: false,
    });
  }
  return items;
}

// ── Risk warnings (computed from risk factor state) ─────────────────────────
function getRiskWarning(riskFactors) {
  if (!riskFactors) return null;
  if (riskFactors.pwhl && riskFactors.orb) {
    return { risk: "Fake Break", action: "Wait for next day to attack BigBlock" };
  }
  return null;
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
      color:C.textMid, marginBottom:5, ...mono }}>{children}</div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}
function TextInput({ value, onChange, placeholder, type="text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      inputMode={type==="number" ? "decimal" : "text"}
      style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`,
        borderRadius:6, padding:"10px 12px", color:C.text, fontSize:14,
        outline:"none", boxSizing:"border-box", ...mono }}
    />
  );
}
function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={3}
      style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`,
        borderRadius:6, padding:"10px 12px", color:C.text, fontSize:13,
        outline:"none", resize:"vertical", boxSizing:"border-box",
        lineHeight:1.5, ...sans }}
    />
  );
}

// ── Phase select ──────────────────────────────────────────────────────────────
function PhaseSelect({ label, value, onChange }) {
  const ps = phaseStyle(value);
  return (
    <div style={{ marginBottom:14 }}>
      <Label>{label}</Label>
      <div style={{ position:"relative" }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{
          width:"100%", background:C.bg,
          border:`1px solid ${value ? ps.border : C.border}`,
          borderRadius:6, padding:"9px 28px 9px 10px",
          color: value ? ps.color : C.textDim,
          fontSize:12, outline:"none", appearance:"none",
          cursor:"pointer", boxSizing:"border-box", ...mono,
          transition:"border-color 0.15s, color 0.15s",
        }}>
          {PHASES.map(p => (
            <option key={p.value} value={p.value} style={{background:C.surface, color:C.text}}>
              {p.label}
            </option>
          ))}
        </select>
        <div style={{ position:"absolute", right:9, top:"50%",
          transform:"translateY(-50%)", pointerEvents:"none",
          fontSize:9, color:C.textDim }}>▼</div>
      </div>
    </div>
  );
}

// ── Phase badge (compact, for card) ──────────────────────────────────────────
function PhaseBadge({ label, value }) {
  const ps = phaseStyle(value);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      background:ps.bg, border:`1px solid ${ps.border}`,
      borderRadius:5, padding:"3px 7px", minWidth:38 }}>
      <span style={{ fontSize:8, color:C.textDim, ...mono, marginBottom:1 }}>{label}</span>
      <span style={{ fontSize:11, color:ps.color, fontWeight:600, ...mono }}>{ps.short}</span>
    </div>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display:"flex", gap:6 }}>
        {[
          { val:true,  label:"Yes", color:C.green, dim:C.greenDim },
          { val:false, label:"No",  color:C.red,   dim:C.redDim   },
        ].map(opt => {
          const active = value === opt.val;
          return (
            <button key={String(opt.val)} onClick={() => onChange(active ? null : opt.val)}
              style={{
                flex:1, padding:"9px 0", borderRadius:6, cursor:"pointer",
                border:`1px solid ${active ? opt.color : C.border}`,
                background: active ? opt.dim : "transparent",
                color: active ? opt.color : C.textDim,
                fontSize:13, fontWeight:600, ...mono, transition:"all 0.15s",
              }}>
              {active ? (opt.val ? "✓ Yes" : "✗ No") : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LowerTfPicker({ value, onChange }) {
  return (
    <div style={{ background:C.orangeDim, border:`1px solid ${C.orange}44`,
      borderRadius:8, padding:"10px 12px", marginTop:-6, marginBottom:14 }}>
      <div style={{ fontSize:10, color:C.orange, ...mono,
        letterSpacing:"0.1em", marginBottom:8 }}>⚡ CHECK LOWER TIMEFRAME</div>
      <div style={{ display:"flex", gap:8 }}>
        {["15m","30m"].map(tf => {
          const active = value === tf;
          return (
            <button key={tf} onClick={() => onChange(active ? null : tf)} style={{
              flex:1, padding:"8px 0", borderRadius:6, cursor:"pointer",
              border:`1px solid ${active ? C.orange : C.border}`,
              background: active ? C.orangeDim : "transparent",
              color: active ? C.orange : C.textDim,
              fontSize:13, fontWeight:600, ...mono, transition:"all 0.15s",
            }}>
              {active ? `✓ ${tf}` : tf}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GateBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"9px 0", borderRadius:6,
      border:`1px solid ${active ? C.green : C.border}`,
      background: active ? C.greenDim : "transparent",
      color: active ? C.green : C.textDim,
      fontSize:13, fontWeight:600, cursor:"pointer", ...mono, transition:"all 0.15s",
    }}>{label}</button>
  );
}

function RiskBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"9px 0", borderRadius:6,
      border:`1px solid ${active ? C.red : C.border}`,
      background: active ? C.redDim : "transparent",
      color: active ? C.red : C.textDim,
      fontSize:12, fontWeight:600, cursor:"pointer", ...mono, transition:"all 0.15s",
    }}>{label}</button>
  );
}

function CatalystRow({ catalyst, onChange, risk }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      background:C.bg, borderRadius:8, padding:"10px 14px", marginBottom:14,
      border:`1px solid ${catalyst ? `${C.amber}55` : C.border}`,
      transition:"border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div onClick={() => onChange(!catalyst)} style={{
          width:38, height:20, borderRadius:10, cursor:"pointer",
          background:catalyst ? C.amber : C.border, position:"relative",
          transition:"background 0.2s", flexShrink:0 }}>
          <div style={{ position:"absolute", top:2,
            left:catalyst ? 19 : 2, width:16, height:16,
            borderRadius:"50%", background:C.white, transition:"left 0.2s" }}/>
        </div>
        <span style={{ fontSize:12, color:catalyst ? C.amber : C.textMid, ...mono }}>
          {catalyst ? "Catalyst" : "No Catalyst"}
        </span>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:20, fontWeight:700,
          color:catalyst ? C.amber : C.blue, ...mono }}>S${risk}</div>
        <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.1em" }}>MAX RISK</div>
      </div>
    </div>
  );
}

function SizeDisplay({ size, entry, stop }) {
  if (entry && stop && (!size || size.lots === 0)) {
    return (
      <div style={{ fontSize:11, color:C.red, ...mono, marginBottom:14, marginTop:-6 }}>
        ⚠ Stop too tight — rounds to 0 lots
      </div>
    );
  }
  if (!size || size.lots === 0) return null;
  return (
    <div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`,
      borderRadius:8, padding:"10px 14px", marginBottom:14, marginTop:-6,
      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <span style={{ fontSize:26, fontWeight:700, color:C.amber, ...mono }}>
          {size.shares.toLocaleString()}
        </span>
        <span style={{ fontSize:12, color:C.textMid, marginLeft:6 }}>
          shares / {size.lots} lots
        </span>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:9, color:C.textDim, ...mono }}>Risk/share</div>
        <div style={{ fontSize:13, color:C.textMid, ...mono }}>
          S${size.rPerShare.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0 14px" }}>
      <div style={{ flex:1, height:1, background:C.border }}/>
      <span style={{ fontSize:9, color:C.textDim, letterSpacing:"0.15em",
        textTransform:"uppercase", ...mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    watching:  { label:"WATCHING",  color:C.amber   },
    ready:     { label:"READY",     color:C.green   },
    executed:  { label:"EXECUTED",  color:C.cyan    },
    cancelled: { label:"VOID",      color:C.textDim },
  };
  const s = map[status] || map.watching;
  return (
    <span style={{ fontSize:9, letterSpacing:"0.14em", fontWeight:700,
      color:s.color, background:`${s.color}18`,
      border:`1px solid ${s.color}44`, borderRadius:4, padding:"2px 6px", ...mono }}>
      {s.label}
    </span>
  );
}

// ── Date picker ───────────────────────────────────────────────────────────────
function DatePicker({ value, onChange }) {
  const isToday = value === todayISO();
  const display = isToday ? "Today"
    : new Date(value + "T00:00:00").toLocaleDateString("en-SG",
        { day:"numeric", month:"short", year:"numeric" });
  const inputRef = useRef(null);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div onClick={() => inputRef.current?.showPicker?.()}
        style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer",
          background:isToday ? C.amberDim : C.blueDim,
          border:`1px solid ${isToday ? `${C.amber}55` : `${C.blue}55`}`,
          borderRadius:6, padding:"5px 10px" }}>
        <span style={{ fontSize:11, color:isToday ? C.amber : C.blue, ...mono }}>📅</span>
        <span style={{ fontSize:11, color:isToday ? C.amber : C.blue, ...mono }}>{display}</span>
      </div>
      {!isToday && (
        <button onClick={() => onChange(todayISO())} style={{
          fontSize:10, color:C.textDim, background:"transparent",
          border:`1px solid ${C.border}`, borderRadius:4,
          padding:"4px 7px", cursor:"pointer", ...mono,
        }}>Today</button>
      )}
      <input ref={inputRef} type="date" value={value}
        onChange={e => onChange(e.target.value)}
        style={{ position:"absolute", opacity:0, pointerEvents:"none", width:0, height:0 }}
      />
    </div>
  );
}

// ── Action strip ──────────────────────────────────────────────────────────────
function ActionStrip({ idea }) {
  const items = getActionItems(idea);
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
      {items.map(item => (
        <div key={item.key} style={{
          display:"flex", alignItems:"flex-start", gap:6,
          background:item.resolved ? C.orangeDim : C.redDim,
          border:`1px solid ${item.resolved ? `${C.orange}44` : `${C.red}33`}`,
          borderRadius:5, padding:"5px 8px",
        }}>
          <span style={{ fontSize:11, color:item.resolved ? C.orange : C.red,
            flexShrink:0, marginTop:1 }}>{item.resolved ? "◐" : "✗"}</span>
          <div>
            <span style={{ fontSize:11, fontWeight:600,
              color:item.resolved ? C.orange : C.red, ...mono }}>{item.label}</span>
            {item.action && (
              <span style={{ fontSize:11, color:C.textMid, ...mono }}>
                {" — "}{item.action}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Idea card ─────────────────────────────────────────────────────────────────
function IdeaCard({ idea, onTap }) {
  const risk      = idea.catalyst ? 1000 : 500;
  const size      = calcSize(risk, idea.entry, idea.stop);
  const isLong    = idea.direction === "long";
  const dirColor  = isLong ? C.green : C.red;
  const isCancelled = idea.status === "cancelled";
  const isExecuted  = idea.status === "executed";
  const accentColor = isExecuted ? C.cyan
    : idea.status === "ready" ? C.green : dirColor;
  const isBackfill = idea.date !== todayISO();

  const hasCtx = idea.weeklyCtx || idea.dailyCtx || idea.mthlyCtx;

  return (
    <div onClick={onTap} style={{
      background:isExecuted ? `${C.cyan}08` : isCancelled ? "transparent" : C.elevated,
      border:`1px solid ${
        isExecuted  ? `${C.cyan}40`  :
        isCancelled ? C.border :
        idea.status === "ready" ? `${C.green}50` : C.border}`,
      borderRadius:10, padding:"12px 14px", cursor:"pointer",
      opacity:isCancelled ? 0.35 : 1,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3,
        background:accentColor, borderRadius:"10px 0 0 10px" }}/>

      <div style={{ paddingLeft:6 }}>
        {/* row 1 */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:7 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:17, fontWeight:700, color:C.text,
              ...mono, letterSpacing:"0.02em" }}>
              {idea.ticker || <span style={{color:C.textDim}}>---</span>}
            </span>
            <span style={{ fontSize:12, color:dirColor, ...mono }}>
              {isLong ? "▲" : "▼"}
            </span>
            {idea.catalyst && (
              <span style={{ fontSize:9, color:C.amber, background:C.amberDim,
                border:`1px solid ${C.amber}44`, borderRadius:3,
                padding:"1px 5px", ...mono }}>CAT</span>
            )}
            {isBackfill && (
              <span style={{ fontSize:9, color:C.blue, background:C.blueDim,
                border:`1px solid ${C.blue}44`, borderRadius:3,
                padding:"1px 5px", ...mono }}>
                {new Date(idea.date+"T00:00:00").toLocaleDateString("en-SG",
                  {day:"numeric",month:"short"})}
              </span>
            )}
          </div>
          <StatusBadge status={idea.status} />
        </div>

        {/* row 2: 1hr + POC + entry/stop/size */}
        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
          {[
            { label:"1hr", val:idea.signal1hr,
              sub: idea.signal1hr===false && idea.lowerTfSignal ? idea.lowerTfSignal : null },
            { label:"POC", val:idea.pocConfirm },
          ].map(item => (
            <div key={item.label} style={{
              display:"flex", alignItems:"center", gap:4,
              background: item.val===true  ? C.greenDim :
                          item.val===false && item.sub ? C.orangeDim :
                          item.val===false ? C.redDim  : `${C.textDim}18`,
              border:`1px solid ${
                item.val===true  ? `${C.green}44`  :
                item.val===false && item.sub ? `${C.orange}44` :
                item.val===false ? `${C.red}44`    : C.border}`,
              borderRadius:5, padding:"3px 8px",
            }}>
              <span style={{ fontSize:9, color:C.textDim, ...mono }}>{item.label}</span>
              <span style={{ fontSize:11, ...mono,
                color: item.val===true ? C.green :
                       item.val===false && item.sub ? C.orange :
                       item.val===false ? C.red : C.textDim }}>
                {item.val===true ? "✓"
                  : item.val===false && item.sub ? item.sub
                  : item.val===false ? "✗" : "—"}
              </span>
            </div>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", gap:12 }}>
            {[
              { l:"Entry", v:idea.entry||"—" },
              { l:"Stop",  v:idea.stop ||"—" },
              { l:"Size",  v:size && size.lots>0 ? `${size.lots}L` : "—" },
            ].map(item => (
              <div key={item.l} style={{ textAlign:"right" }}>
                <div style={{ fontSize:9, color:C.textDim, ...mono }}>{item.l}</div>
                <div style={{ fontSize:12, color:C.text, ...mono }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* row 3: context badges + gates + grade */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
          {/* Phase badges — only if set */}
          {(idea.weeklyCtx || idea.dailyCtx || idea.mthlyCtx) && (
            <div style={{ display:"flex", gap:4 }}>
              {idea.mthlyCtx  && <PhaseBadge label="M" value={idea.mthlyCtx}  />}
              {idea.weeklyCtx && <PhaseBadge label="W" value={idea.weeklyCtx} />}
              {idea.dailyCtx  && <PhaseBadge label="D" value={idea.dailyCtx}  />}
            </div>
          )}
          {["G1","G2","G3","G4"].map(g => idea.gates[g] ? (
            <span key={g} style={{ fontSize:10, ...mono, padding:"2px 6px",
              borderRadius:4, border:`1px solid ${C.green}`,
              color:C.green, background:C.greenDim }}>{g}</span>
          ) : null)}
          {idea.riskFactors?.pwhl && (
            <span style={{ fontSize:9, ...mono, padding:"2px 5px",
              borderRadius:4, border:`1px solid ${C.red}`,
              color:C.red, background:C.redDim }}>PWH/L</span>
          )}
          {idea.riskFactors?.orb && (
            <span style={{ fontSize:9, ...mono, padding:"2px 5px",
              borderRadius:4, border:`1px solid ${C.red}`,
              color:C.red, background:C.redDim }}>ORB</span>
          )}
          {idea.riskFactors?.pwhl && idea.riskFactors?.orb && (
            <span style={{ fontSize:9, ...mono, padding:"2px 6px",
              borderRadius:4, border:`1px solid ${C.red}`,
              color:C.white, background:C.red, fontWeight:700 }}>FAKE BREAK</span>
          )}
        </div>

        {idea.observation && (
          <div style={{ fontSize:11, color:C.textMid, marginTop:7,
            lineHeight:1.4, ...sans,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {idea.observation}
          </div>
        )}

        <ActionStrip idea={idea} />
      </div>
    </div>
  );
}

// ── Edit panel ────────────────────────────────────────────────────────────────
function EditPanel({ idea, onSave, onClose, onExecute, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...idea });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const backdropRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const setGate = g => setForm(f => ({ ...f, gates:{ ...f.gates, [g]:!f.gates[g] } }));
  const setRisk = r => setForm(f => ({ ...f, riskFactors:{ ...(f.riskFactors || { pwhl:false, orb:false }), [r]:!(f.riskFactors || {})[r] } }));
  const setSignal1hr = v =>
    setForm(f => ({ ...f, signal1hr:v, lowerTfSignal:v !== false ? null : f.lowerTfSignal }));

  const risk = form.catalyst ? 1000 : 500;
  const size = calcSize(risk, form.entry, form.stop);
  const gatesOn = Object.values(form.gates).filter(Boolean).length;

  const coreComplete = form.ticker && form.entry && form.stop
    && size && size.lots > 0
    && form.signal1hr !== null && form.pocConfirm !== null
    && (form.signal1hr === true || !!form.lowerTfSignal)
    && form.pocConfirm === true;

  const handleSave = () => {
    let status = form.status;
    if (status === "watching" && coreComplete) status = "ready";
    if (status === "ready" && !coreComplete) status = "watching";
    onSave({ ...form, status,
      updatedAt:new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"}) });
  };

  const handleBackdrop = e => {
    if (e.target === backdropRef.current) { handleSave(); onClose(); }
  };

  const isVoided   = form.status === "cancelled";
  const isExecuted = form.status === "executed";
  const zoneMeta   = KILL_ZONES.find(z => z.id === idea.killZone);

  return (
    <div ref={backdropRef} onClick={handleBackdrop} style={{
      position:"fixed", inset:0, background:"rgba(8,12,20,0.88)",
      zIndex:100, display:"flex", alignItems:"flex-end",
      backdropFilter:"blur(4px)",
    }}>
      <div style={{
        width:"100%", maxWidth:500, margin:"0 auto",
        background:C.surface, borderRadius:"16px 16px 0 0",
        border:`1px solid ${C.border}`, borderBottom:"none",
        padding:"0 20px 36px", maxHeight:"92vh", overflowY:"auto",
        animation:"slideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.border }}/>
        </div>

        {/* header */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ fontSize:11, color:C.textMid, ...mono, letterSpacing:"0.1em" }}>
              {zoneMeta?.label.toUpperCase()} · {zoneMeta?.time}
            </div>
            <DatePicker value={form.date} onChange={v => set("date",v)} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {!isExecuted && !isVoided && (
              <button onClick={() => { onCancel(idea.id); onClose(); }} style={{
                padding:"5px 10px", borderRadius:6,
                border:`1px solid ${C.border}`, background:"transparent",
                color:C.textDim, fontSize:11, cursor:"pointer", ...mono,
              }}>Void</button>
            )}
            <button onClick={() => { handleSave(); onClose(); }} style={{
              padding:"5px 14px", borderRadius:6,
              border:`1px solid ${C.amber}`, background:C.amberDim,
              color:C.amber, fontSize:11, cursor:"pointer", ...mono,
            }}>Save ✓</button>
          </div>
        </div>

        {/* ── IMMEDIATE ── */}
        <CatalystRow catalyst={form.catalyst} onChange={v => set("catalyst",v)} risk={risk} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <Field label="Ticker">
            <TextInput value={form.ticker} onChange={v => set("ticker",v.toUpperCase())} placeholder="D05" />
          </Field>
          <Field label="Direction">
            <div style={{ display:"flex", gap:6 }}>
              {["long","short"].map(d => (
                <button key={d} onClick={() => set("direction",d)} style={{
                  flex:1, padding:"10px 0", borderRadius:6, cursor:"pointer",
                  border:`1px solid ${form.direction===d ? (d==="long"?C.green:C.red) : C.border}`,
                  background:form.direction===d ? (d==="long"?C.greenDim:C.redDim) : "transparent",
                  color:form.direction===d ? (d==="long"?C.green:C.red) : C.textDim,
                  fontSize:12, ...mono,
                }}>{d==="long" ? "▲ Long" : "▼ Short"}</button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <YesNo label="1hr Signal" value={form.signal1hr} onChange={setSignal1hr} />
          <YesNo label="POC Confirm" value={form.pocConfirm} onChange={v => set("pocConfirm",v)} />
        </div>

        {form.signal1hr === false && (
          <LowerTfPicker value={form.lowerTfSignal} onChange={v => set("lowerTfSignal",v)} />
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <Field label="Entry (SGD)">
            <TextInput type="number" value={form.entry} onChange={v => set("entry",v)} placeholder="0.000" />
          </Field>
          <Field label="Stop (SGD)">
            <TextInput type="number" value={form.stop} onChange={v => set("stop",v)} placeholder="0.000" />
          </Field>
        </div>

        <SizeDisplay size={size} entry={form.entry} stop={form.stop} />

        {coreComplete && (
          <div style={{ fontSize:11, color:C.green, ...mono,
            marginBottom:14, marginTop:-6, display:"flex", alignItems:"center", gap:5 }}>
            <span>●</span> Core complete — ready to execute
          </div>
        )}

        {/* ── RISK ── */}
        <Divider label="Risk" />

        <Field label="Risk Factors">
          <div style={{ display:"flex", gap:8 }}>
            <RiskBtn label="PWH/L · PMH/L" active={(form.riskFactors || {}).pwhl}
              onClick={() => setRisk("pwhl")} />
            <RiskBtn label="Outside 15m ORB" active={(form.riskFactors || {}).orb}
              onClick={() => setRisk("orb")} />
          </div>
        </Field>

        {getRiskWarning(form.riskFactors) && (() => {
          const w = getRiskWarning(form.riskFactors);
          return (
            <div style={{
              background: C.redDim,
              border: `1px solid ${C.red}55`,
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 14,
              marginTop: -6,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
              }}>
                <span style={{ fontSize: 14 }}>⚠</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: C.red,
                  letterSpacing: "0.08em", textTransform: "uppercase", ...mono,
                }}>
                  {w.risk}
                </span>
              </div>
              <div style={{
                fontSize: 11, color: C.text, ...sans, lineHeight: 1.4,
                paddingLeft: 22,
              }}>
                <span style={{ color: C.amber, fontWeight: 600, ...mono }}>Action:</span>{" "}
                {w.action}
              </div>
            </div>
          );
        })()}

        {/* ── WHEN TIME PERMITS ── */}
        <Divider label="When time permits" />

        {/* MTF Context — 3 phase selects */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          <PhaseSelect label="Monthly" value={form.mthlyCtx}  onChange={v => set("mthlyCtx",v)}  />
          <PhaseSelect label="Weekly"  value={form.weeklyCtx} onChange={v => set("weeklyCtx",v)} />
          <PhaseSelect label="Daily"   value={form.dailyCtx}  onChange={v => set("dailyCtx",v)}  />
        </div>

        <Field label="POC Gates (G1–G4)">
          <div style={{ display:"flex", gap:8 }}>
            {["G1","G2","G3","G4"].map(g => (
              <GateBtn key={g} label={g} active={form.gates[g]} onClick={() => setGate(g)} />
            ))}
          </div>
          {gatesOn > 0 && (
            <div style={{ fontSize:10, color:C.textDim, ...mono, marginTop:5 }}>
              {gatesOn}/4 active{gatesOn >= 3 ? " — high conviction" : ""}
            </div>
          )}
        </Field>

        <Field label="Observation">
          <Textarea value={form.observation} onChange={v => set("observation",v)}
            placeholder="Rationale, key levels, context..." />
        </Field>

        {!isExecuted && !isVoided && (
          <button onClick={() => {
            onExecute({ ...form, status:"executed",
              executedAt:new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"}),
              updatedAt: new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"}) });
            onClose();
          }} style={{
            width:"100%", padding:"13px", borderRadius:10, border:"none",
            background:coreComplete ? C.green : C.border,
            color:coreComplete ? C.bg : C.textDim,
            fontSize:13, fontWeight:700,
            cursor:coreComplete ? "pointer" : "not-allowed",
            ...mono, letterSpacing:"0.1em", textTransform:"uppercase",
            marginTop:4, transition:"background 0.2s, color 0.2s",
          }}>⚡ Mark Executed</button>
        )}

        {isExecuted && (
          <div style={{ textAlign:"center", fontSize:12, color:C.cyan,
            ...mono, padding:"12px 0" }}>
            ✓ Executed at {form.executedAt}
          </div>
        )}

        {/* Delete entry */}
        <div style={{ borderTop:`1px solid ${C.border}`, marginTop:10, paddingTop:14 }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{
              width:"100%", padding:"10px", borderRadius:8,
              border:`1px solid ${C.border}`, background:"transparent",
              color:C.textDim, fontSize:11, cursor:"pointer", ...mono,
              transition:"all 0.15s",
            }}>Delete Entry</button>
          ) : (
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{
                flex:1, padding:"10px", borderRadius:8,
                border:`1px solid ${C.border}`, background:"transparent",
                color:C.textDim, fontSize:11, cursor:"pointer", ...mono,
              }}>Cancel</button>
              <button onClick={() => { onDelete(idea.id); onClose(); }} style={{
                flex:1, padding:"10px", borderRadius:8,
                border:`1px solid ${C.red}`, background:C.redDim,
                color:C.red, fontSize:11, fontWeight:700, cursor:"pointer", ...mono,
              }}>Confirm Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Kill zone section ─────────────────────────────────────────────────────────
function KillZoneSection({ zone, ideas, onAddIdea, onTapIdea }) {
  const zoneIdeas = ideas.filter(i => i.killZone === zone.id);
  const activeCount = zoneIdeas.filter(i => i.status !== "cancelled").length;
  return (
    <div style={{ marginBottom:26 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.amber,
          ...mono, letterSpacing:"0.14em" }}>{zone.label}</span>
        <span style={{ fontSize:10, color:C.textDim, ...mono }}>{zone.time}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
        <span style={{ fontSize:10, color:C.textDim, ...mono }}>
          {activeCount} idea{activeCount!==1?"s":""}
        </span>
        <button onClick={() => onAddIdea(zone.id)} style={{
          width:24, height:24, borderRadius:6, border:`1px solid ${C.border}`,
          background:"transparent", color:C.textMid, fontSize:16,
          cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", padding:0, lineHeight:1,
        }}>+</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {zoneIdeas.length === 0 ? (
          <div onClick={() => onAddIdea(zone.id)} style={{
            border:`1px dashed ${C.border}`, borderRadius:10,
            padding:14, textAlign:"center", cursor:"pointer",
            color:C.textDim, fontSize:12, ...mono, letterSpacing:"0.06em",
          }}>+ add idea</div>
        ) : zoneIdeas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onTap={() => onTapIdea(idea)} />
        ))}
      </div>
    </div>
  );
}

function StatsBar({ ideas }) {
  const watching = ideas.filter(i => i.status==="watching").length;
  const ready    = ideas.filter(i => i.status==="ready").length;
  const executed = ideas.filter(i => i.status==="executed").length;
  return (
    <div style={{ display:"flex", background:C.elevated,
      borderRadius:8, border:`1px solid ${C.border}`,
      overflow:"hidden", marginBottom:20 }}>
      {[
        { label:"Watching", val:watching, color:C.amber },
        { label:"Ready",    val:ready,    color:C.green },
        { label:"Executed", val:executed, color:C.cyan  },
      ].map((s,i) => (
        <div key={s.label} style={{ flex:1, padding:"9px 0", textAlign:"center",
          borderRight:i<2 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ fontSize:18, fontWeight:700, color:s.color, ...mono }}>{s.val}</div>
          <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.1em", marginTop:1 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [view, setView]   = useState("board");

  // ── Load from Supabase on mount (offline-safe) ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadIdeas() {
      if (!supabase) return; // no client → stay on in-memory state
      try {
        const { data, error } = await supabase
          .from("ideas").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setIdeas(data.map(rowToIdea));
      } catch (e) {
        console.warn("[Supabase] load failed, using in-memory state:", e.message);
      }
    }
    loadIdeas();
    return () => { cancelled = true; };
  }, []);

  // ── Persistence helpers (offline-safe — UI updates first, DB follows) ──────
  async function persistUpsert(idea) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("ideas").upsert(ideaToRow(idea));
      if (error) throw error;
    } catch (e) {
      console.warn("[Supabase] save failed, using in-memory state:", e.message);
    }
  }

  const addIdea = kz => {
    const idea = newIdea(kz);
    setIdeas(p => [...p, idea]);
    setEditing(idea);
    persistUpsert(idea); // create the row so later edit/void can target it
  };
  const saveIdea = u => {
    setIdeas(p => p.map(i => i.id === u.id ? u : i));
    persistUpsert(u);
  };
  const executeIdea = u => {
    setIdeas(p => p.map(i => i.id === u.id ? u : i));
    persistUpsert(u);
  };
  const deleteIdea = id => {
    setIdeas(p => p.filter(i => i.id !== id));
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase.from("ideas").delete().eq("id", String(id));
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] delete failed, using in-memory state:", e.message);
      }
    })();
  };
  const cancelIdea = id => {
    const updatedAt = new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"});
    setIdeas(p => p.map(i => i.id === id ? { ...i, status:"cancelled", updatedAt } : i));
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from("ideas").update({ status:"cancelled", updated_at: updatedAt }).eq("id", String(id));
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] cancel failed, using in-memory state:", e.message);
      }
    })();
  };

  // ── Clear session: wipe local view AND cloud ───────────────────────────────
  const clearAll = () => {
    setIdeas([]);
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase.from("ideas").delete().neq("id", "");
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] clear failed, using in-memory state:", e.message);
      }
    })();
  };

  const boardIdeas    = ideas.filter(i=>i.status!=="executed");
  const executedIdeas = ideas.filter(i=>i.status==="executed");

  return (
    <div style={{ background:C.bg, minHeight:"100vh",
      padding:"16px 16px 56px", ...sans }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;700&display=swap');
        @keyframes slideUp {
          from { transform:translateY(100%); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        * { box-sizing:border-box; }
        input:focus, select:focus, textarea:focus {
          border-color:${C.amber} !important;
          box-shadow:0 0 0 2px ${C.amberDim};
        }
        input::placeholder, textarea::placeholder { color:${C.textDim}; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        input[type=date] { color-scheme:dark; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
        select option { background:${C.surface}; color:${C.text}; }
      `}</style>

      <div style={{ maxWidth:500, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"0.2em", color:C.amber,
              ...mono, marginBottom:3 }}>SGX · ORDERFLOW</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.white,
              letterSpacing:"-0.02em" }}>Session Board</div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={() => setView(v=>v==="board"?"executed":"board")} style={{
              padding:"6px 12px", borderRadius:6,
              border:`1px solid ${view==="executed" ? C.cyan : C.border}`,
              background:view==="executed" ? `${C.cyan}15` : "transparent",
              color:view==="executed" ? C.cyan : C.textDim,
              fontSize:11, cursor:"pointer", ...mono,
            }}>Executed ({executedIdeas.length})</button>
            <button onClick={() => {
              if (window.confirm("Clear session and start fresh?")) clearAll();
            }} style={{
              padding:"6px 10px", borderRadius:6, border:`1px solid ${C.border}`,
              background:"transparent", color:C.textDim,
              fontSize:13, cursor:"pointer", ...mono,
            }}>↺</button>
          </div>
        </div>

        <StatsBar ideas={ideas} />

        {view==="board" ? (
          KILL_ZONES.map(zone => (
            <KillZoneSection key={zone.id} zone={zone} ideas={boardIdeas}
              onAddIdea={addIdea} onTapIdea={setEditing} />
          ))
        ) : (
          <div>
            <div style={{ fontSize:11, color:C.textMid, ...mono,
              letterSpacing:"0.1em", marginBottom:14 }}>EXECUTED TRADES</div>
            {executedIdeas.length===0 ? (
              <div style={{ textAlign:"center", color:C.textDim,
                padding:40, fontSize:12, ...mono }}>No executed trades yet.</div>
            ) : executedIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditPanel idea={editing} onSave={saveIdea} onClose={() => setEditing(null)}
          onExecute={executeIdea} onCancel={cancelIdea} onDelete={deleteIdea} />
      )}
    </div>
  );
}
