'use client';

import { C, mono } from '../lib/constants';

export default function StatusBadge({ status }) {
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
