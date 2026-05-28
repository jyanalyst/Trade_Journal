'use client';

import Link from 'next/link';
import { useIdeas } from '../lib/IdeasContext';
import { todayISO } from '../lib/helpers';
import StatsBar from '../components/StatsBar';
import { C, mono, sans } from '../lib/constants';

export default function HomePage() {
  const { ideas, watchingIdeas, readyIdeas, executedIdeas, boardIdeas } = useIdeas();

  const todayIdeas = ideas.filter(i => i.date === todayISO());
  const todayExecuted = todayIdeas.filter(i => i.status === 'executed').length;
  const todayPending = todayIdeas.filter(i => i.status === 'watching' || i.status === 'ready').length;

  const navCards = [
    {
      href: '/session',
      label: 'Session Board',
      desc: `Kill zone layout with ${boardIdeas.filter(i => i.status !== 'cancelled').length} active ideas`,
      color: C.amber,
    },
    {
      href: '/pending',
      label: 'Pending Ideas',
      desc: `${watchingIdeas.length} watching, ${readyIdeas.length} ready`,
      color: C.green,
    },
    {
      href: '/executed',
      label: 'Executed Trades',
      desc: `${executedIdeas.length} trade${executedIdeas.length !== 1 ? 's' : ''} executed`,
      color: C.cyan,
    },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '16px 16px 16px', ...sans }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.amber, ...mono, marginBottom: 3 }}>
            SGX · ORDERFLOW
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: '-0.02em' }}>
            Trade Journal
          </div>
        </div>

        <StatsBar ideas={ideas} />

        {/* Today summary */}
        <div style={{
          background: C.elevated, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '12px 14px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: '0.12em', ...mono, marginBottom: 8 }}>
            TODAY&apos;S SESSION
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.amber, ...mono }}>{todayPending}</div>
              <div style={{ fontSize: 9, color: C.textDim, ...mono }}>Pending</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.cyan, ...mono }}>{todayExecuted}</div>
              <div style={{ fontSize: 9, color: C.textDim, ...mono }}>Executed</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, ...mono }}>{todayIdeas.length}</div>
              <div style={{ fontSize: 9, color: C.textDim, ...mono }}>Total</div>
            </div>
          </div>
        </div>

        {/* Navigation cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {navCards.map(card => (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: C.elevated,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                  background: card.color, borderRadius: '10px 0 0 10px',
                }} />
                <div style={{ paddingLeft: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, ...mono, marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, ...mono }}>
                    {card.desc}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
