'use client';

import { useEffect, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { NutriMascot } from '@/components/mascot/NutriMascot';

const TRAIL_COUNT = 12;

// Static floating decorations — rendered once, animated via CSS
const FloatingDecorations = memo(function FloatingDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="floating-astronaut" style={{ top: '15%', left: '5%', animationDelay: '0s', opacity: 0.1, fontSize: '40px' }}>◉</div>
      <div className="floating-astronaut" style={{ top: '60%', right: '3%', animationDelay: '-3s', fontSize: '30px', opacity: 0.08 }}>◎</div>
      <div className="floating-rocket" style={{ top: '30%', right: '15%', animationDuration: '25s', animationDelay: '-10s', fontSize: '24px', opacity: 0.06 }}>▲</div>
      <div className="floating-rocket" style={{ top: '75%', left: '10%', animationDuration: '30s', animationDelay: '-5s', fontSize: '20px', opacity: 0.05 }}>▲</div>
      <div className="floating-planet" style={{ top: '15%', right: '8%', animationDelay: '-2s', fontSize: '50px', opacity: 0.06 }}>◌</div>
      <div className="floating-star-em" style={{ top: '8%', left: '30%', animationDelay: '0s', animationDuration: '2s' }}>✦</div>
      <div className="floating-star-em" style={{ top: '45%', left: '12%', animationDelay: '-1s', animationDuration: '4s' }}>✧</div>
    </div>
  );
});

// Cursor effect — uses direct DOM manipulation, zero React re-renders on mouse move
function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const trailIndexRef = useRef(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const container = trailContainerRef.current;
    if (!dot || !ring || !container) return;

    // Pre-create trail elements (circular buffer)
    const trails: HTMLDivElement[] = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'cursor-trail';
      el.style.opacity = String((i / TRAIL_COUNT) * 0.5);
      el.style.transform = `scale(${(i / TRAIL_COUNT) * 0.8 + 0.2})`;
      container.appendChild(el);
      trails.push(el);
    }

    let rafId: number | null = null;
    let mouseX = -100;
    let mouseY = -100;

    const updateCursor = () => {
      dot.style.left = `${mouseX - 6}px`;
      dot.style.top = `${mouseY - 6}px`;
      ring.style.left = `${mouseX - 20}px`;
      ring.style.top = `${mouseY - 20}px`;

      const idx = trailIndexRef.current % TRAIL_COUNT;
      const trailEl = trails[idx];
      trailEl.style.left = `${mouseX - 2}px`;
      trailEl.style.top = `${mouseY - 2}px`;
      trailIndexRef.current = idx + 1;

      rafId = null;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(updateCursor);
      }
    };

    document.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouse);
      if (rafId !== null) cancelAnimationFrame(rafId);
      trails.forEach(el => el.remove());
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ left: -100, top: -100 }} />
      <div ref={ringRef} className="cursor-ring" style={{ left: -100, top: -100 }} />
      <div ref={trailContainerRef} className="fixed inset-0 pointer-events-none z-[99997]" />
    </>
  );
}

// Particle burst on click — isolated state, unmounts after animation
function ClickParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ['#00F5FF', '#FF006E', '#FFD60A', '#FF00FF', '#7B2FBE'];

    const handleClick = (e: MouseEvent) => {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (360 / 10) * i + Math.random() * 20;
        const dist = 25 + Math.random() * 25;
        p.style.cssText = `
          position:absolute; width:5px; height:5px; border-radius:50%;
          background:${color}; box-shadow:0 0 6px ${color};
          left:${e.clientX - 2.5}px; top:${e.clientY - 2.5}px;
          --tx:${Math.cos((angle * Math.PI) / 180) * dist}px;
          --ty:${Math.sin((angle * Math.PI) / 180) * dist}px;
          animation:particleFly 0.7s ease-out forwards;
          animation-delay:${i * 0.015}s;
        `;
        fragment.appendChild(p);
      }
      container.appendChild(fragment);
      setTimeout(() => {
        while (container.firstChild) container.removeChild(container.firstChild);
      }, 900);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[99996]" />;
}

// Memoized Sidebar — no re-renders from cursor or particle changes
const MemoizedSidebar = memo(Sidebar);

export default function SpaceThemeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Derive mascot context from current path
  const nutriContext = pathname === '/games' ? 'juegos'
    : pathname === '/builder' ? 'crear-juego'
    : pathname === '/classrooms' ? 'salones'
    : pathname === '/metrics' ? 'metricas'
    : 'dashboard';

  return (
    <div className="flex relative z-10 min-h-screen">
      {/* Background layers — CSS-only */}
      <div className="starfield" />
      <div className="retro-grid-bg" />

      {/* Floating decorations — static render */}
      <FloatingDecorations />

      {/* Cursor — direct DOM, no React state */}
      <CursorEffect />
      <ClickParticles />

      {/* Sidebar — memoized */}
      <MemoizedSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 galaxy-bg overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* Andrés Nutrialenz — mascota del sistema */}
      <NutriMascot
        context={nutriContext}
        variant="corner"
        autoTip={true}
        tipInterval={45000}
      />
    </div>
  );
}
