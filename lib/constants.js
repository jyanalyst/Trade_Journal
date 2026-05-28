export const C = {
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

export const PHASES = [
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

export function phaseStyle(val) {
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

export const KILL_ZONES = [
  { id:"opening", label:"Opening", time:"08:30" },
  { id:"kz1000",  label:"1000",   time:"10:00" },
  { id:"kz1100",  label:"1100",   time:"11:00" },
  { id:"kz1300",  label:"1300",   time:"13:00" },
  { id:"kz1400",  label:"1400",   time:"14:00" },
  { id:"kz1500",  label:"1500",   time:"15:00" },
  { id:"kz1600",  label:"1600",   time:"16:00" },
  { id:"kz1700",  label:"1700",   time:"17:00" },
];

export const mono = { fontFamily:"'DM Mono',monospace" };
export const sans = { fontFamily:"'IBM Plex Sans',sans-serif" };
