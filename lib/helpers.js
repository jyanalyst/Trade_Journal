import { C } from "./constants";

export function todayISO() { return new Date().toISOString().slice(0,10); }

export function calcSize(risk, entry, stop) {
  const r = parseFloat(risk), e = parseFloat(entry), s = parseFloat(stop);
  if (!r || !e || !s || e === s) return null;
  const diff = Math.abs(e - s);
  const lots = Math.floor(r / diff / 1000);
  return { lots, shares: lots * 1000, rPerShare: diff };
}

export function newIdea(killZone) {
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
    weeklyCtx:  "",
    dailyCtx:   "",
    mthlyCtx:   "",
    gates: { G1:false, G2:false, G3:false, G4:false },
    riskFactors: { pwhl:false, orb:false },
    observation: "",
    executedAt: null,
    exitPrice: "",
    crtBias: null,
    dailyCandle: null,
  };
}

export function getActionItems(idea) {
  const items = [];
  if (idea.signal1hr === false) {
    const tf = idea.lowerTfSignal;
    items.push({
      key: "1hr",
      label: tf ? `${tf} Signal confirmed` : "No 1hr Signal",
      action: tf ? null : "Check 5m / 15m / 30m Signal",
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

export function calcPnL(entry, exitPrice, direction, shares) {
  const e = parseFloat(entry), x = parseFloat(exitPrice);
  if (!e || !x || !shares) return null;
  const diff = direction === "long" ? x - e : e - x;
  return Math.round(diff * shares * 100) / 100;
}

export function getRiskWarning(riskFactors) {
  if (!riskFactors) return null;
  if (riskFactors.pwhl && riskFactors.orb) {
    return { risk: "Fake Break", action: "Wait for next day to attack BigBlock" };
  }
  return null;
}
