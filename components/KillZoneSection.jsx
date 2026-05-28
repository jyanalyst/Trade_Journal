'use client';

import { C, mono } from '../lib/constants';
import IdeaCard from './IdeaCard';

export default function KillZoneSection({ zone, ideas, onAddIdea, onTapIdea }) {
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
