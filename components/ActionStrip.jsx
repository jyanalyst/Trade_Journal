'use client';

import { C, mono } from '../lib/constants';
import { getActionItems } from '../lib/helpers';

export default function ActionStrip({ idea }) {
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
