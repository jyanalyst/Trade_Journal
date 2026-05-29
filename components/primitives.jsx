'use client';

import { useRef } from 'react';
import { C, PHASES, phaseStyle, mono, sans } from '../lib/constants';
import { todayISO } from '../lib/helpers';

export function Label({ children }) {
  return (
    <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
      color:C.textMid, marginBottom:5, ...mono }}>{children}</div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type="text" }) {
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

export function Textarea({ value, onChange, placeholder }) {
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

export function PhaseSelect({ label, value, onChange }) {
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

export function PhaseBadge({ label, value }) {
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

export function YesNo({ label, value, onChange }) {
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

export function LowerTfPicker({ value, onChange }) {
  return (
    <div style={{ background:C.orangeDim, border:`1px solid ${C.orange}44`,
      borderRadius:8, padding:"10px 12px", marginTop:-6, marginBottom:14 }}>
      <div style={{ fontSize:10, color:C.orange, ...mono,
        letterSpacing:"0.1em", marginBottom:8 }}>⚡ CHECK LOWER TIMEFRAME</div>
      <div style={{ display:"flex", gap:8 }}>
        {["5m","15m","30m"].map(tf => {
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

export function GateBtn({ label, active, onClick }) {
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

export function RiskBtn({ label, active, onClick }) {
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

export function CatalystRow({ catalyst, onChange, risk }) {
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

export function SizeDisplay({ size, entry, stop }) {
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

export function Divider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0 14px" }}>
      <div style={{ flex:1, height:1, background:C.border }}/>
      <span style={{ fontSize:9, color:C.textDim, letterSpacing:"0.15em",
        textTransform:"uppercase", ...mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

export function DatePicker({ value, onChange }) {
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
