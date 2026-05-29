'use client';

import { useIdeas } from '../../lib/IdeasContext';
import IdeaCard from '../../components/IdeaCard';
import { C, mono, sans } from '../../lib/constants';

export default function ExecutedPage() {
  const { runningIdeas, completedIdeas, setEditing } = useIdeas();
  const total = runningIdeas.length + completedIdeas.length;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 16px', ...sans }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.amber,
            ...mono, marginBottom: 3 }}>SGX · ORDERFLOW</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white,
            letterSpacing: '-0.02em' }}>Executed Trades</div>
          <div style={{ fontSize: 12, color: C.textDim, ...mono, marginTop: 4 }}>
            {total} trade{total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Running section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.cyan, ...mono,
            letterSpacing: '0.1em', marginBottom: 10 }}>
            RUNNING ({runningIdeas.length})
          </div>
          {runningIdeas.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textDim,
              padding: 20, fontSize: 12, ...mono }}>
              No running trades.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {runningIdeas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
              ))}
            </div>
          )}
        </div>

        {/* Completed section */}
        <div>
          <div style={{ fontSize: 11, color: C.green, ...mono,
            letterSpacing: '0.1em', marginBottom: 10 }}>
            COMPLETED ({completedIdeas.length})
          </div>
          {completedIdeas.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textDim,
              padding: 20, fontSize: 12, ...mono }}>
              No completed trades.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completedIdeas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
