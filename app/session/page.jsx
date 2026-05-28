'use client';

import { useIdeas } from '../../lib/IdeasContext';
import KillZoneSection from '../../components/KillZoneSection';
import StatsBar from '../../components/StatsBar';
import { C, KILL_ZONES, mono, sans } from '../../lib/constants';

export default function SessionPage() {
  const { ideas, boardIdeas, addIdea, setEditing, clearAll } = useIdeas();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 16px', ...sans }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.amber,
              ...mono, marginBottom: 3 }}>SGX · ORDERFLOW</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white,
              letterSpacing: '-0.02em' }}>Session Board</div>
          </div>
          <button onClick={() => {
            if (window.confirm('Clear session and start fresh?')) clearAll();
          }} style={{
            padding: '6px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
            background: 'transparent', color: C.textDim,
            fontSize: 13, cursor: 'pointer', ...mono,
          }}>↺</button>
        </div>

        <StatsBar ideas={ideas} />

        {KILL_ZONES.map(zone => (
          <KillZoneSection key={zone.id} zone={zone} ideas={boardIdeas}
            onAddIdea={addIdea} onTapIdea={setEditing} />
        ))}
      </div>
    </div>
  );
}
