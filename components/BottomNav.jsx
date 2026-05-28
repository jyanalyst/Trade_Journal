'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { C, mono } from '../lib/constants';

const TABS = [
  { href: '/',         label: 'Home',     icon: '◉' },
  { href: '/session',  label: 'Session',  icon: '◎' },
  { href: '/pending',  label: 'Pending',  icon: '◷' },
  { href: '/executed', label: 'Executed', icon: '✓' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: 'flex', justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', maxWidth: 500, width: '100%' }}>
        {TABS.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '8px 0 10px',
              textDecoration: 'none',
              color: active ? C.amber : C.textDim,
              ...mono, fontSize: 9, letterSpacing: '0.08em',
              transition: 'color 0.15s',
            }}>
              <span style={{ fontSize: 18, marginBottom: 2 }}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
