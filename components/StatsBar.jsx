'use client';

import { C, mono } from '../lib/constants';

export default function StatsBar({ ideas }) {
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
