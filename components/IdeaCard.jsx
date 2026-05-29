'use client';

import { C, mono, sans } from '../lib/constants';
import { todayISO, calcSize, calcPnL, getRiskWarning } from '../lib/helpers';
import { PhaseBadge } from './primitives';
import StatusBadge from './StatusBadge';
import ActionStrip from './ActionStrip';

export default function IdeaCard({ idea, onTap }) {
  const risk      = idea.catalyst ? 1000 : 500;
  const size      = calcSize(risk, idea.entry, idea.stop);
  const isLong    = idea.direction === "long";
  const dirColor  = isLong ? C.green : C.red;
  const isCancelled = idea.status === "cancelled";
  const isExecuted  = idea.status === "executed";
  const accentColor = isExecuted ? C.cyan
    : idea.status === "ready" ? C.green : dirColor;
  const isBackfill = idea.date !== todayISO();

  const riskWarning = getRiskWarning(idea.riskFactors);
  const pnl = isExecuted && idea.exitPrice
    ? calcPnL(idea.entry, idea.exitPrice, idea.direction, size?.shares) : null;

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

        {/* row 3: context badges + gates + risk factors */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
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
          {idea.crtBias && (
            <span style={{ fontSize:9, ...mono, padding:"2px 6px",
              borderRadius:4,
              border:`1px solid ${idea.crtBias === "bullish" ? C.green : C.red}`,
              color:idea.crtBias === "bullish" ? C.green : C.red,
              background:idea.crtBias === "bullish" ? C.greenDim : C.redDim }}>
              CRT {idea.crtBias === "bullish" ? "▲" : "▼"}
            </span>
          )}
        </div>

        {/* Risk warning action text */}
        {riskWarning && (
          <div style={{
            display:"flex", alignItems:"flex-start", gap:6,
            background:C.redDim,
            border:`1px solid ${C.red}33`,
            borderRadius:5, padding:"5px 8px", marginTop:6,
          }}>
            <span style={{ fontSize:11, color:C.red, flexShrink:0, marginTop:1 }}>⚠</span>
            <div>
              <span style={{ fontSize:10, fontWeight:700, color:C.red, ...mono }}>
                {riskWarning.risk}
              </span>
              <span style={{ fontSize:10, color:C.amber, ...mono }}>
                {" — "}{riskWarning.action}
              </span>
            </div>
          </div>
        )}

        {pnl !== null && (
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:pnl >= 0 ? C.greenDim : C.redDim,
            border:`1px solid ${pnl >= 0 ? `${C.green}33` : `${C.red}33`}`,
            borderRadius:5, padding:"5px 10px", marginTop:6,
          }}>
            <span style={{ fontSize:9, color:C.textDim, letterSpacing:"0.1em", ...mono }}>P&L</span>
            <span style={{ fontSize:14, fontWeight:700,
              color:pnl >= 0 ? C.green : C.red, ...mono }}>
              {pnl >= 0 ? "+" : ""}S${pnl.toFixed(2)}
            </span>
          </div>
        )}

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
