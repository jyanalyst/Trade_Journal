'use client';

import { useIdeas } from '../../lib/IdeasContext';
import IdeaCard from '../../components/IdeaCard';
import { C, mono, sans } from '../../lib/constants';

export default function ExecutedPage() {
  const { executedIdeas, setEditing } = useIdeas();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 16px', ...sans }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.amber,
            ...mono, marginBottom: 3 }}>SGX · ORDERFLOW</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white,
            letterSpacing: '-0.02em' }}>Executed Trades</div>
          <div style={{ fontSize: 12, color: C.textDim, ...mono, marginTop: 4 }}>
            {executedIdeas.length} trade{executedIdeas.length !== 1 ? 's' : ''}
          </div>
        </div>

        {executedIdeas.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textDim,
            padding: 40, fontSize: 12, ...mono }}>
            No executed trades yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {executedIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
