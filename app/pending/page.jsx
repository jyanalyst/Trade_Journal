'use client';

import { useIdeas } from '../../lib/IdeasContext';
import IdeaCard from '../../components/IdeaCard';
import { C, mono, sans } from '../../lib/constants';

export default function PendingPage() {
  const { watchingIdeas, readyIdeas, setEditing } = useIdeas();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 16px', ...sans }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.amber,
            ...mono, marginBottom: 3 }}>SGX · ORDERFLOW</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white,
            letterSpacing: '-0.02em' }}>Pending Ideas</div>
        </div>

        {/* Ready section first (higher priority) */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.green, ...mono,
            letterSpacing: '0.1em', marginBottom: 10 }}>
            READY ({readyIdeas.length})
          </div>
          {readyIdeas.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textDim,
              padding: 20, fontSize: 12, ...mono }}>
              No ready ideas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {readyIdeas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
              ))}
            </div>
          )}
        </div>

        {/* Watching section */}
        <div>
          <div style={{ fontSize: 11, color: C.amber, ...mono,
            letterSpacing: '0.1em', marginBottom: 10 }}>
            WATCHING ({watchingIdeas.length})
          </div>
          {watchingIdeas.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textDim,
              padding: 20, fontSize: 12, ...mono }}>
              No watching ideas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {watchingIdeas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} onTap={() => setEditing(idea)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
