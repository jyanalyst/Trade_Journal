'use client';

import { useState, useRef } from 'react';
import { C, KILL_ZONES, mono, sans } from '../lib/constants';
import { calcSize, calcPnL, getRiskWarning } from '../lib/helpers';
import {
  Field, TextInput, Textarea, PhaseSelect, YesNo,
  LowerTfPicker, GateBtn, RiskBtn, CatalystRow,
  SizeDisplay, Divider, DatePicker,
} from './primitives';

export default function EditPanel({ idea, onSave, onClose, onExecute, onCancel, onDelete }) {
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

        {/* IMMEDIATE */}
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

        {/* RISK */}
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

        {/* WHEN TIME PERMITS */}
        <Divider label="When time permits" />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          <PhaseSelect label="Monthly" value={form.mthlyCtx}  onChange={v => set("mthlyCtx",v)}  />
          <PhaseSelect label="Weekly"  value={form.weeklyCtx} onChange={v => set("weeklyCtx",v)} />
          <PhaseSelect label="Daily"   value={form.dailyCtx}  onChange={v => set("dailyCtx",v)}  />
        </div>

        <Field label="Daily CRT Bias">
          <div style={{ display:"flex", gap:6 }}>
            {[
              { val:"bullish",  label:"▲ Bullish", color:C.green, dim:C.greenDim },
              { val:"bearish",  label:"▼ Bearish", color:C.red,   dim:C.redDim   },
            ].map(opt => {
              const active = form.crtBias === opt.val;
              return (
                <button key={opt.val} onClick={() => set("crtBias", active ? null : opt.val)}
                  style={{
                    flex:1, padding:"9px 0", borderRadius:6, cursor:"pointer",
                    border:`1px solid ${active ? opt.color : C.border}`,
                    background: active ? opt.dim : "transparent",
                    color: active ? opt.color : C.textDim,
                    fontSize:12, fontWeight:600, ...mono, transition:"all 0.15s",
                  }}>{active ? `✓ ${opt.label}` : opt.label}</button>
              );
            })}
          </div>
        </Field>

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

        {isExecuted && (() => {
          const pnl = calcPnL(form.entry, form.exitPrice, form.direction, size?.shares);
          return (
            <>
              <div style={{ marginBottom:14 }}>
                <Field label="Exit Price (SGD)">
                  <TextInput type="number" value={form.exitPrice} onChange={v => set("exitPrice",v)} placeholder="0.000" />
                </Field>
                {pnl !== null && (
                  <div style={{
                    background: pnl >= 0 ? C.greenDim : C.redDim,
                    border:`1px solid ${pnl >= 0 ? `${C.green}44` : `${C.red}44`}`,
                    borderRadius:8, padding:"10px 14px", marginTop:-6,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <span style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", ...mono }}>P&L</span>
                    <span style={{ fontSize:20, fontWeight:700,
                      color:pnl >= 0 ? C.green : C.red, ...mono }}>
                      {pnl >= 0 ? "+" : ""}S${pnl.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ textAlign:"center", fontSize:10, color:C.textDim,
                ...mono, paddingBottom:4 }}>
                Executed at {form.executedAt}
              </div>
            </>
          );
        })()}

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
