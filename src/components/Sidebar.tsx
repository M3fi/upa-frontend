'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Inicio', icon: '◈' },
  { href: '/games', label: 'Juegos', icon: '◆' },
  { href: '/builder', label: 'Crear juego', icon: '✦' },
  { href: '/builder/sequence', label: 'Secuencia', icon: '⊞' },
  { href: '/classrooms', label: 'Salones', icon: '▣' },
  { href: '/metrics', label: 'Métricas', icon: '⊞' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      } min-h-screen flex-shrink-0 sidebar-glow-border transition-all duration-300 ease-in-out relative`}
      style={{
        background: 'linear-gradient(180deg, #0d0221 0%, #1a0533 40%, #0d0221 100%)',
      }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Planet decoration */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: '-14px',
          right: '-24px',
          fontSize: '70px',
          opacity: 0.06,
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '-2s',
          transform: 'rotate(15deg)',
          color: '#7B2FBE',
        }}
      >
        ◌
      </div>

      {/* Logo */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <span
            className="text-2xl animate-float"
            style={{
              animationDuration: '4s',
              color: '#00F5FF',
              textShadow: '0 0 15px rgba(0,245,255,0.5)',
              display: 'inline-block',
            }}
          >
            ▲
          </span>
          {!collapsed && (
            <div className="relative">
              <h1
                className="text-2xl font-bold tracking-wider glitch-text"
                data-text="Upa!"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  background: 'linear-gradient(90deg, #FFD60A, #FF006E, #FFD60A)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'colorShift 3s linear infinite',
                  textShadow: '0 0 20px rgba(255, 214, 10, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
                  fontSize: '20px',
                  letterSpacing: '4px',
                }}
              >
                Upa!
              </h1>
              <div
                className="text-[10px] text-neon-cyan/60 mt-1 tracking-[3px]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                v0.1.0-m0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 mx-4 mb-4 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), rgba(255,0,110,0.3), transparent)',
      }} />

      {/* Navigation */}
      <nav className="relative z-10 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden"
              style={{
                animation: `slideInLeft 0.4s ease-out ${0.05 * idx}s both`,
                background: active
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(0, 245, 255, 0.15)'
                  : '1px solid transparent',
              }}
            >
              {/* Active indicator */}
              {active && (
                <div className="nav-active-indicator" />
              )}

              {/* Travel light on hover */}
              <div className="nav-item-light" />

              {/* Icon */}
              <span
                className={`text-lg transition-all duration-300 relative z-10 ${
                  active ? 'scale-110' : 'group-hover:scale-125 group-hover:rotate-12'
                }`}
                style={{
                  color: active ? '#00F5FF' : 'rgba(180, 160, 220, 0.4)',
                  textShadow: active ? '0 0 10px rgba(0,245,255,0.5)' : 'none',
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {item.icon}
              </span>

              {/* Label */}
              {!collapsed && (
                <span
                  className={`text-sm tracking-wider relative z-10 transition-all duration-300 ${
                    active
                      ? 'text-neon-cyan font-bold text-glow-cyan'
                      : 'text-purple-200/60 group-hover:text-white group-hover:translate-x-1'
                  }`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {item.label}
                </span>
              )}

              {/* Glow dot */}
              {active && !collapsed && (
                <span className="ml-auto relative z-10">
                  <span
                    className="block w-2 h-2 rounded-full"
                    style={{
                      background: '#00F5FF',
                      boxShadow: '0 0 8px #00F5FF, 0 0 16px rgba(0,245,255,0.5)',
                      animation: 'neonPulse 2s ease-in-out infinite',
                    }}
                  />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="mx-4 mb-3 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.2), transparent)',
        }} />

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span
            className="text-sm transition-transform duration-300 group-hover:scale-110"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'rgba(180, 160, 220, 0.4)',
            }}
          >
            ▸
          </span>
          {!collapsed && (
            <span
              className="text-xs text-purple-300/40 tracking-widest"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              COLLAPSE
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
