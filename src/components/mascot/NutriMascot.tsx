'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { NutriSVG, type SchoolTool } from './NutriSVG';
import { NUTRI_TIPS, NUTRI_FACTS, SCHOOL_TOOLS, SCHOOL_TOOLS_LABELS } from './nutri-content';
import './NutriMascot.css';

type NutriMood = 'idle' | 'talking' | 'excited' | 'thinking';
type NutriContext = 'dashboard' | 'juegos' | 'salones' | 'metricas' | 'crear-juego';

interface NutriMascotProps {
  context?: NutriContext;
  variant?: 'floating' | 'corner' | 'fullscreen';
  autoTip?: boolean;
  tipInterval?: number;
  toolInterval?: number;
}

export function NutriMascot({
  context = 'dashboard',
  variant = 'corner',
  autoTip = false,
  tipInterval = 45000,
  toolInterval = 60000,
}: NutriMascotProps) {
  const [mood, setMood] = useState<NutriMood>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<SchoolTool | null>(null);

  // ── Draggable ──
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [position, setPosition] = useState({ bottom: 24, right: 24 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;
    const rect = containerRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const newRight = window.innerWidth - e.clientX - (containerRef.current.offsetWidth - dragOffset.current.x);
      const newBottom = window.innerHeight - e.clientY - (containerRef.current.offsetHeight - dragOffset.current.y);
      setPosition({
        right: Math.max(0, Math.min(newRight, window.innerWidth - 80)),
        bottom: Math.max(0, Math.min(newBottom, window.innerHeight - 80)),
      });
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ── Auto-tip ──
  useEffect(() => {
    if (!autoTip) return;
    const id = setInterval(() => {
      const tips = NUTRI_TIPS[context] ?? NUTRI_TIPS.dashboard;
      showMessage(tips[Math.floor(Math.random() * tips.length)], 'talking');
    }, tipInterval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, autoTip, tipInterval]);

  // ── Útiles escolares periódicos ──
  useEffect(() => {
    const id = setInterval(() => {
      const tool = SCHOOL_TOOLS[Math.floor(Math.random() * SCHOOL_TOOLS.length)];
      setActiveTool(tool);
      setMood('excited');
      setTimeout(() => {
        setActiveTool(null);
        setMood('idle');
      }, 5000);
    }, toolInterval);
    return () => clearInterval(id);
  }, [toolInterval]);

  // ── Helpers ──
  function showMessage(text: string, newMood: NutriMood = 'talking') {
    setMood(newMood);
    setMessage(text);
    setTimeout(() => { setMood('idle'); setMessage(null); }, 15000);
  }

  function handleNutriClick() {
    const tips = NUTRI_TIPS[context] ?? NUTRI_TIPS.dashboard;
    showMessage(tips[Math.floor(Math.random() * tips.length)], 'excited');
  }

  function handleFactClick() {
    const next = (factIndex + 1) % NUTRI_FACTS.length;
    setFactIndex(next);
    showMessage(NUTRI_FACTS[next].text, 'thinking');
  }

  // ── Render ──
  if (!isVisible) {
    return (
      <button
        className="nutri-revive-btn"
        onClick={() => setIsVisible(true)}
        aria-label="Mostrar a Andrés Nutrialenz"
        title="Mostrar a Andrés"
        style={{ bottom: position.bottom, right: position.right }}
      >
        🦦
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`nutri-container nutri-${variant}${isMinimized ? ' nutri-minimized' : ''}`}
      data-mood={mood}
      style={variant === 'corner' ? { bottom: position.bottom, right: position.right } : undefined}
      onMouseDown={onMouseDown}
    >
      {/* ── Barra de control ── */}
      <div className="nutri-controls">
        <span className="nutri-controls__label">Lic. Nutrialenz</span>
        <button
          className="nutri-ctrl-btn"
          onClick={() => setIsMinimized(v => !v)}
          aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
          title={isMinimized ? 'Expandir' : 'Minimizar'}
        >
          {isMinimized ? '＋' : '－'}
        </button>
        <button
          className="nutri-ctrl-btn nutri-ctrl-btn--close"
          onClick={() => setIsVisible(false)}
          aria-label="Ocultar a Andrés"
          title="Ocultar"
        >
          ✕
        </button>
      </div>

      {/* ── Contenido (oculto en minimized) ── */}
      {!isMinimized && (
        <>
          {message && (
            <div className="nutri-bubble" role="status" aria-live="polite">
              <span className="nutri-bubble__prefix">▸ LIC. NUTRIALENZ ::</span>
              <p>{message}</p>
              <div className="nutri-bubble__scanline" aria-hidden="true" />
            </div>
          )}

          {activeTool && (
            <div className="nutri-tool-label" aria-live="polite">
              {SCHOOL_TOOLS_LABELS[activeTool]}
            </div>
          )}

          <button
            className="nutri-sprite-btn"
            onClick={handleNutriClick}
            aria-label="Pide un consejo al Lic. Andrés Nutrialenz"
            title="Haz clic para un consejo"
          >
            <NutriSVG mood={mood} toolItem={activeTool} />
          </button>

          <button
            className="nutri-fact-btn"
            onClick={handleFactClick}
            title="Dato curioso"
            aria-label="Ver dato curioso"
          >
            <span aria-hidden="true">★</span> DATO CURIOSO
          </button>
        </>
      )}
    </div>
  );
}
