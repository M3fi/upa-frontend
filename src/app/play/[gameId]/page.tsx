'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface GameData {
  gameId: string;
  templateType: string;
  content: any;
  rules: { basePoints?: number; timeLimitSec?: number; lives?: number };
}

interface QuestionResult {
  questionIndex: number;
  isCorrect: boolean;
  elapsedMs: number;
}

export default function PlayPage({ params }: { params: { gameId: string } }) {
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  // ── Answer states per template ──
  const [sionoAnswer, setSiONoAnswer] = useState<boolean | null>(null);
  const [omSelected, setOMSelected] = useState<number | null>(null);
  const [msSelected, setMSSelected] = useState<number[]>([]);
  const [rcMapping, setRCMapping] = useState<Record<number, number>>({});
  const [seqOrder, setSeqOrder] = useState<string[]>([]);
  const [sopaFound, setSopaFound] = useState<string[]>([]);
  const [wordCountInfo, setWordCountInfo] = useState<{ found: number; total: number } | null>(null);

  // ── Memoria play state ──
  const [memoriaFlipped, setMemoriaFlipped] = useState<Set<string>>(new Set());
  const [memoriaMatched, setMemoriaMatched] = useState<Set<string>>(new Set());

  // ── Crucigrama play state ──
  const [crosswordAnswers, setCrosswordAnswers] = useState<Record<string, string>>({});

  // ── CompletarEspacios play state ──
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setError('No hay sesión activa'); setLoading(false); return; }
    fetch(`/api/games/${params.gameId}/render`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error('Error al cargar juego'); return r.json(); })
      .then((d: GameData) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [params.gameId]);

  const calcScore = useCallback((isCorrect: boolean, elapsedMs: number, streakCount: number, accuracy?: number) => {
    if (!data) return 0;
    const base = data.rules?.basePoints || 100;
    const timeLimitSec = data.rules?.timeLimitSec || 60;
    const timeRatio = timeLimitSec > 0 ? Math.max(0.3, 1 - (elapsedMs / 1000) / (timeLimitSec * 2)) : 1;
    if (data.templateType === 'SopaDeLetras') {
      return Math.round(base * (accuracy ?? 0) * timeRatio);
    }
    if (!isCorrect) return 0;
    return Math.round(base * timeRatio);
  }, [data]);

  async function submitAnswer(answerPayload: any) {
    if (!data || submitting) return;
    setSubmitting(true);
    const elapsedMs = Date.now() - startTime;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sessions/${data.gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionIndex: qi,
          answer: answerPayload,
          elapsedMs,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error('Submit answer error:', res.status, errBody);
        return false;
      }
      const result = await res.json();
      const isCorrect = result.isCorrect ?? false;
      const newStreak = isCorrect ? streak + 1 : 0;
      let accuracy: number | undefined;
      if (data.templateType === 'SopaDeLetras') {
        const words = (data.content as any)?.words || [];
        const foundWords = (answerPayload as any)?.foundWords || [];
        accuracy = words.length > 0 ? foundWords.length / words.length : 0;
      }
      const earned = calcScore(isCorrect, elapsedMs, streak, accuracy);
      setStreak(newStreak);
      setScore((s) => s + earned);
      setResults((r) => [...r, { questionIndex: qi, isCorrect, elapsedMs }]);
      return isCorrect;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function goNext(answerPayload: any) {
    await submitAnswer(answerPayload);
    if (!data) return;
    const questions = getQuestions(data);
    if (qi + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQi(qi + 1);
      resetAnswerState();
    }
  }

  function resetAnswerState() {
    setSiONoAnswer(null);
    setOMSelected(null);
    setMSSelected([]);
    setRCMapping({});
    setSeqOrder([]);
    setMemoriaMatched(new Set());
    setMemoriaFlipped(new Set());
    setCrosswordAnswers({});
    setFillAnswers([]);
  }

  function getQuestions(d: GameData): any[] {
    const c = d.content;
    switch (d.templateType) {
      case 'SiONo': return c.questions || [];
      case 'OpcionMultiple': return c.questions || [];
      case 'MultiSeleccion': return c.questions || [];
      case 'RelacionarColumnas': return c.pairs ? [c] : [];
      case 'OrdenarSecuencia': return c.items ? [c] : [];
      case 'SopaDeLetras': return [c];
      case 'Memoria': return [(c as any).pairs ? { pairs: (c as any).pairs } : c];
      case 'Crucigrama': return [(c as any).clues ? c : {}];
      case 'CompletarEspacios': return [c];
      case 'Secuencia': return [(c as any).steps ? c : {}];
      default: return [];
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0221' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float" style={{ color: '#00F5FF' }}>◈</div>
          <div className="text-sm tracking-widest text-purple-300/50" style={{ fontFamily: "'Orbitron', sans-serif" }}>CARGANDO JUEGO...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0221' }}>
        <div className="glass rounded-2xl p-8 neon-border-pink text-center" style={{ borderRadius: '24px' }}>
          <div className="text-4xl mb-4" style={{ color: '#FF006E' }}>⚠</div>
          <div className="text-sm text-neon-pink tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>ERROR</div>
          <div className="text-xs text-purple-300/50 mb-4">{error || 'Juego no encontrado'}</div>
          <button onClick={() => window.location.href = '/games'}
            className="px-5 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}>← VOLVER A JUEGOS</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const total = results.length;
    const correct = results.filter((r) => r.isCorrect).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d0221' }}>
        <div className="glass rounded-2xl p-8 sm:p-12 neon-border-cyan w-full max-w-md text-center" style={{ borderRadius: '24px' }}>
          <div className="text-5xl mb-4 animate-float" style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>▲</div>
          <h1 className="text-lg font-bold mb-2" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(90deg, #FFD60A, #FF006E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JUEGO COMPLETADO</h1>
          <div className="text-4xl font-bold my-3" style={{ color: '#FFD60A', fontFamily: "'Press Start 2P', monospace" }}>{score}</div>
          <div className="text-xs text-purple-300/50 tracking-wider mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>PUNTOS TOTALES</div>
          <div className="h-px w-full my-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />
          {wordCountInfo ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><div className="text-2xl font-bold text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace" }}>{wordCountInfo.found}</div><div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>PALABRAS ENCONTRADAS</div></div>
              <div><div className="text-2xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: wordCountInfo.found >= wordCountInfo.total ? '#00FF64' : '#FF006E' }}>{wordCountInfo.found >= wordCountInfo.total ? '100%' : Math.round((wordCountInfo.found / wordCountInfo.total) * 100) + '%'}</div><div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>EFECTIVIDAD</div></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div><div className="text-lg font-bold text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace" }}>{correct}</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>CORRECTAS</div></div>
              <div><div className="text-lg font-bold text-neon-pink" style={{ fontFamily: "'Press Start 2P', monospace" }}>{total - correct}</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>INCORRECTAS</div></div>
              <div><div className="text-lg font-bold text-neon-yellow" style={{ fontFamily: "'Press Start 2P', monospace" }}>{pct}%</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>PRECISION</div></div>
            </div>
          )}
          <div className="mb-6">
            <div className="text-lg font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: '#7B2FBE' }}>{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>TIEMPO TOTAL</div>
          </div>
          <button onClick={() => window.location.href = '/games'}
            className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
            style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            VOLVER A JUEGOS
          </button>
        </div>
      </div>
    );
  }

  const questions = getQuestions(data);
  const question = questions[qi];
  const progress = questions.length > 0 ? ((qi) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0221' }}>
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => window.location.href = '/games'}
          className="text-[10px] text-purple-400/40 hover:text-neon-cyan transition-colors tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}>← SALIR</button>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold" style={{ color: '#FFD60A', fontFamily: "'Press Start 2P', monospace" }}>{score}</div>
          {streak > 1 && <div className="text-[9px] text-neon-pink" style={{ fontFamily: "'Orbitron', sans-serif" }}>x{streak}</div>}
        </div>
      </div>
      <div className="mx-4 h-1 rounded-full bg-white/5 overflow-hidden" style={{ borderRadius: '4px' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00F5FF, #7B2FBE)' }} />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {data.templateType === 'SiONo' && (
            <SiONoPlay question={question} qi={qi} answer={sionoAnswer} setAnswer={setSiONoAnswer} onSubmit={() => goNext(sionoAnswer)} submitting={submitting} />
          )}
          {data.templateType === 'OpcionMultiple' && (
            <OpcionMultiplePlay question={question} qi={qi} selected={omSelected} setSelected={setOMSelected} onSubmit={() => goNext(omSelected)} submitting={submitting} />
          )}
          {data.templateType === 'MultiSeleccion' && (
            <MultiSeleccionPlay question={question} qi={qi} selected={msSelected} setSelected={setMSSelected} onSubmit={() => goNext(msSelected)} submitting={submitting} />
          )}
          {data.templateType === 'RelacionarColumnas' && (
            <RelacionarColumnasPlay question={question} mapping={rcMapping} setMapping={setRCMapping} onSubmit={() => goNext({ mappings: rcMapping })} submitting={submitting} />
          )}
          {data.templateType === 'OrdenarSecuencia' && (
            <OrdenarSecuenciaPlay question={question} order={seqOrder} setOrder={setSeqOrder} onSubmit={() => goNext(seqOrder)} submitting={submitting} />
          )}
          {data.templateType === 'SopaDeLetras' && (
            <SopaDeLetrasPlay question={question} found={sopaFound} setFound={setSopaFound} timeLimitSec={data.rules?.timeLimitSec} onSubmit={() => {
              const words = (question as any)?.words || [];
              setWordCountInfo({ found: sopaFound.length, total: words.length });
              goNext({ foundWords: sopaFound });
            }} submitting={submitting} />
          )}
          {data.templateType === 'Memoria' && (
            <MemoriaPlay question={question} flipped={memoriaFlipped} setFlipped={setMemoriaFlipped} matched={memoriaMatched} setMatched={setMemoriaMatched} onComplete={async (payload: Record<string, string>) => { await submitAnswer(payload); window.location.href = '/games'; }} submitting={submitting} />
          )}
          {data.templateType === 'Crucigrama' && (
            <CrucigramaPlay question={question} answers={crosswordAnswers} setAnswers={setCrosswordAnswers} onSubmit={() => goNext(crosswordAnswers)} submitting={submitting} />
          )}
          {data.templateType === 'CompletarEspacios' && (
            <CompletarEspaciosPlay question={question} answers={fillAnswers} setAnswers={setFillAnswers} onSubmit={() => goNext(fillAnswers)} submitting={submitting} />
          )}
          {data.templateType === 'Secuencia' && (
            <SecuenciaPlay question={question} submitting={submitting} />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SiONo — Verdadero / Falso
// ═══════════════════════════════════════════════════════════════
function SiONoPlay({ question, qi, answer, setAnswer, onSubmit, submitting }: any) {
  return (
    <div className="glass rounded-2xl p-8 neon-border-cyan text-center" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>PREGUNTA {qi + 1} — VERDADERO / FALSO</div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-8 leading-relaxed" style={{ fontFamily: "'Orbitron', sans-serif" }}>{question?.prompt}</h2>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setAnswer(true)} className={`px-8 py-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 ${answer === true ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ fontFamily: "'Press Start 2P', monospace", background: answer === true ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)', color: answer === true ? '#00F5FF' : 'rgba(255,255,255,0.5)' }}>VERDADERO</button>
        <button onClick={() => setAnswer(false)} className={`px-8 py-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 ${answer === false ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ fontFamily: "'Press Start 2P', monospace", background: answer === false ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)', color: answer === false ? '#00F5FF' : 'rgba(255,255,255,0.5)' }}>FALSO</button>
      </div>
      {answer !== null && <button onClick={onSubmit} disabled={submitting} className="mt-8 px-6 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONFIRMAR →'}</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  OpcionMultiple
// ═══════════════════════════════════════════════════════════════
function OpcionMultiplePlay({ question, qi, selected, setSelected, onSubmit, submitting }: any) {
  return (
    <div className="glass rounded-2xl p-8 neon-border-purple" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>PREGUNTA {qi + 1} — OPCION MULTIPLE</div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-8 leading-relaxed" style={{ fontFamily: "'Orbitron', sans-serif" }}>{question?.prompt}</h2>
      <div className="space-y-3">{question?.options?.map((opt: string, oi: number) => (
        <button key={oi} onClick={() => setSelected(oi)} className={`w-full text-left p-4 rounded-xl text-sm tracking-wider transition-all duration-300 ${selected === oi ? 'neon-border-cyan' : 'border border-white/10 hover:border-white/30'}`} style={{ fontFamily: "'Orbitron', sans-serif", background: selected === oi ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)', color: selected === oi ? '#00F5FF' : 'rgba(255,255,255,0.7)' }}><span className="mr-3 text-neon-cyan/50">{String.fromCharCode(65 + oi)}</span> {opt}</button>
      ))}</div>
      {selected !== null && <button onClick={onSubmit} disabled={submitting} className="mt-6 w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONFIRMAR →'}</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MultiSeleccion
// ═══════════════════════════════════════════════════════════════
function MultiSeleccionPlay({ question, qi, selected, setSelected, onSubmit, submitting }: any) {
  function toggle(oi: number) { setSelected(selected.includes(oi) ? selected.filter((i: number) => i !== oi) : [...selected, oi]); }
  return (
    <div className="glass rounded-2xl p-8 neon-border-cyan" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>PREGUNTA {qi + 1} — MULTI-SELECCION</div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed" style={{ fontFamily: "'Orbitron', sans-serif" }}>{question?.prompt}</h2>
      <div className="space-y-3 mb-6">{question?.options?.map((opt: any, oi: number) => (
        <button key={oi} onClick={() => toggle(oi)} className={`w-full text-left p-4 rounded-xl text-sm tracking-wider transition-all duration-300 ${selected.includes(oi) ? 'neon-border-cyan' : 'border border-white/10 hover:border-white/30'}`} style={{ fontFamily: "'Orbitron', sans-serif", background: selected.includes(oi) ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)', color: selected.includes(oi) ? '#00F5FF' : 'rgba(255,255,255,0.7)' }}>
          <span className={`mr-3 inline-block w-5 h-5 rounded border text-center text-[10px] leading-5 ${selected.includes(oi) ? 'border-neon-cyan bg-neon-cyan/20' : 'border-white/20'}`}>{selected.includes(oi) ? '✓' : ''}</span> {opt.text}
        </button>
      ))}</div>
      <button onClick={onSubmit} disabled={submitting || selected.length === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONFIRMAR →'}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RelacionarColumnas
// ═══════════════════════════════════════════════════════════════
function RelacionarColumnasPlay({ question, mapping, setMapping, onSubmit, submitting }: any) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pairResults, setPairResults] = useState<boolean[]>([]);
  const pairs: { left: string; right: string }[] = question?.pairs || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const CONNECTION_COLORS = ['#00F5FF', '#FF006E', '#FFD60A', '#7B2FBE', '#00FF64', '#FF9500', '#FF00FF', '#00B8FF'];
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

  function handleLeftClick(leftIdx: number) { if (!submitted) setSelectedLeft(selectedLeft === leftIdx ? null : leftIdx); }
  function handleRightClick(rightIdx: number) {
    if (submitted) return;
    if (selectedLeft !== null) {
      const newMap = { ...mapping };
      for (const k of Object.keys(newMap)) { if (newMap[Number(k)] === rightIdx) delete newMap[Number(k)]; }
      newMap[selectedLeft] = rightIdx; setMapping(newMap); setSelectedLeft(null);
    } else {
      const entry = Object.entries(mapping).find(([, v]) => v === rightIdx);
      if (entry) { const newMap = { ...mapping }; delete newMap[Number(entry[0])]; setMapping(newMap); }
    }
  }

  function getConnectionLines() {
    if (!containerRef.current) return [];
    const rect = containerRef.current.getBoundingClientRect();
    const linesArr: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    let colorIdx = 0;
    for (const [leftStr, rightIdx] of Object.entries(mapping)) {
      const leftIdx = parseInt(leftStr);
      const leftEl = leftRefs.current[leftIdx];
      const rightEl = rightRefs.current[rightIdx as number];
      if (leftEl && rightEl) {
        const lr = leftEl.getBoundingClientRect();
        const rr = rightEl.getBoundingClientRect();
        linesArr.push({ x1: lr.right - rect.left, y1: lr.top + lr.height / 2 - rect.top, x2: rr.left - rect.left, y2: rr.top + rr.height / 2 - rect.top, color: CONNECTION_COLORS[colorIdx % CONNECTION_COLORS.length] });
        colorIdx++;
      }
    }
    return linesArr;
  }

  useEffect(() => {
    const timer = setTimeout(() => setLines(getConnectionLines()), 50);
    return () => clearTimeout(timer);
  }, [mapping, pairs.length]);

  function handleConfirm() {
    const correct: Record<number, number> = {};
    for (let i = 0; i < pairs.length; i++) correct[i] = i;
    const results = pairs.map((_, i) => mapping[i] === i);
    setPairResults(results); setSubmitted(true);
  }

  function handleContinue() { setSubmitted(false); setMapping({}); onSubmit(); }

  if (submitted) {
    const correctCount = pairResults.filter(Boolean).length;
    return (
      <div className="glass rounded-2xl p-8 neon-border-cyan space-y-4" style={{ borderRadius: '24px' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">{correctCount === pairs.length ? '✓' : '✗'}</div>
          <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: correctCount === pairs.length ? '#00FF64' : '#FF006E' }}>{correctCount === pairs.length ? 'CORRECTO' : 'INCORRECTO'}</h2>
          <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{correctCount} DE {pairs.length} PARES CORRECTOS</p>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />
        <div className="space-y-2">{pairs.map((p, i) => {
          const ok = pairResults[i];
          return <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: ok ? 'rgba(0,255,100,0.3)' : 'rgba(255,0,110,0.3)', background: ok ? 'rgba(0,255,100,0.06)' : 'rgba(255,0,110,0.06)' }}>
            <span className="text-[9px]" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? '✓' : '✗'}</span>
            <span className="flex-1 text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}><span className="text-neon-cyan">{p.left}</span><span className="mx-2 text-purple-400/40">↔</span><span className="text-neon-yellow">{p.right}</span></span>
            {!ok && <span className="text-[8px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>SE ESPERABA: {p.right}</span>}
          </div>;
        })}</div>
        <button onClick={handleContinue} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 neon-border-yellow" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>RELACIONAR COLUMNAS — TOCA UN CONCEPTO Y LUEGO SU PAREJA</div>
      <div ref={containerRef} className="relative grid grid-cols-2 gap-4 mb-6">
        {lines.length > 0 && <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>{lines.map((line, i) => <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />)}</svg>}
        <div className="space-y-2">{pairs.map((p, i) => {
          const mappedColor = mapping[i] !== undefined ? CONNECTION_COLORS[Object.keys(mapping).indexOf(String(i)) % CONNECTION_COLORS.length] : undefined;
          return <button key={`l-${i}`} ref={(el) => { leftRefs.current[i] = el; }} onClick={() => handleLeftClick(i)} className={`w-full p-3 rounded-xl text-xs tracking-wider transition-all duration-300 ${selectedLeft === i ? 'neon-border-cyan ring-2 ring-neon-cyan/30' : mapping[i] !== undefined ? 'border-2' : 'border border-white/10 hover:border-white/30'}`} style={{ fontFamily: "'Orbitron', sans-serif", color: mapping[i] !== undefined ? '#fff' : 'rgba(255,255,255,0.7)', borderColor: mapping[i] !== undefined ? (mappedColor || '#00F5FF') : undefined, background: mapping[i] !== undefined ? `${mappedColor || '#00F5FF'}22` : undefined }}>{p.left}{mapping[i] !== undefined && <span className="ml-2 text-[8px] opacity-60" style={{ fontFamily: "'Press Start 2P', monospace" }}>↔</span>}</button>;
        })}</div>
        <div className="space-y-2">{pairs.map((p, i) => {
          const mappedEntry = Object.entries(mapping).find(([, v]) => v === i);
          const mappedColor = mappedEntry ? CONNECTION_COLORS[Object.keys(mapping).indexOf(mappedEntry[0]) % CONNECTION_COLORS.length] : undefined;
          const isMapped = mappedEntry !== undefined;
          return <button key={`r-${i}`} ref={(el) => { rightRefs.current[i] = el; }} onClick={() => handleRightClick(i)} className={`w-full p-3 rounded-xl text-xs tracking-wider transition-all duration-300 ${isMapped ? 'border-2' : selectedLeft !== null ? 'border border-white/30 hover:border-neon-cyan/50 cursor-pointer' : 'border border-white/10 hover:border-white/30'}`} style={{ fontFamily: "'Orbitron', sans-serif", color: isMapped ? '#fff' : 'rgba(255,255,255,0.7)', borderColor: isMapped ? (mappedColor || '#00F5FF') : undefined, background: isMapped ? `${mappedColor || '#00F5FF'}22` : undefined }}>{p.right}{isMapped && <span className="ml-2 text-[8px] opacity-60" style={{ fontFamily: "'Press Start 2P', monospace" }}>✕</span>}</button>;
        })}</div>
      </div>
      <button onClick={handleConfirm} disabled={Object.keys(mapping).length !== pairs.length} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FFD60A, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,214,10,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{Object.keys(mapping).length === pairs.length ? 'VERIFICAR →' : `SELECCIONA ${pairs.length - Object.keys(mapping).length} MAS`}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  OrdenarSecuencia
// ═══════════════════════════════════════════════════════════════
function OrdenarSecuenciaPlay({ question, order, setOrder, onSubmit, submitting }: any) {
  useEffect(() => { if (order.length === 0) setOrder((question?.items || []).map((i: any) => i.id).sort(() => Math.random() - 0.5)); }, []);
  const items: { id: string; text: string; correctOrder: number }[] = question?.items || [];
  const [showResult, setShowResult] = useState(false);
  const [positionResults, setPositionResults] = useState<boolean[]>([]);
  const itemMap = new Map(items.map(i => [i.id, i.text]));
  const correctIndexMap = new Map(items.map(i => [i.id, i.correctOrder]));
  function moveItem(fromIdx: number, direction: -1 | 1) {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= order.length) return;
    const copy = [...order]; const rm = copy.splice(fromIdx, 1)[0]; copy.splice(toIdx, 0, rm); setOrder(copy);
  }
  function handleConfirm() {
    const correctOrder = [...items].sort((a, b) => a.correctOrder - b.correctOrder).map(i => i.id);
    const results = order.map((id: string, idx: number) => correctOrder[idx] === id);
    setPositionResults(results); setShowResult(true);
  }
  function handleContinue() { setShowResult(false); setOrder([]); onSubmit(); }
  if (showResult) {
    const correctCount = positionResults.filter(Boolean).length;
    return (
      <div className="glass rounded-2xl p-8 neon-border-cyan space-y-4" style={{ borderRadius: '24px' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">{correctCount === items.length ? '✓' : '✗'}</div>
          <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: correctCount === items.length ? '#00FF64' : '#FF006E' }}>{correctCount === items.length ? 'ORDEN CORRECTO' : 'ORDEN INCORRECTO'}</h2>
          <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{correctCount} DE {items.length} POSICIONES CORRECTAS</p>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />
        <div className="space-y-2">{order.map((id: string, idx: number) => {
          const ok = positionResults[idx];
          return <div key={id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: ok ? 'rgba(0,255,100,0.3)' : 'rgba(255,0,110,0.3)', background: ok ? 'rgba(0,255,100,0.06)' : 'rgba(255,0,110,0.06)' }}>
            <span className="text-[9px] w-5 text-center" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? '✓' : '✗'}</span>
            <span className="text-[10px] text-neon-cyan/60 w-6 text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>{idx + 1}</span>
            <span className="flex-1 text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{itemMap.get(id) || id}</span>
            {!ok && <span className="text-[8px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>DEBERIA IR EN #{correctIndexMap.get(id) || '?'}</span>}
          </div>;
        })}</div>
        <button onClick={handleContinue} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 neon-border-purple" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>ORDENAR SECUENCIA — ORDENA LOS ELEMENTOS CORRECTAMENTE</div>
      <div className="space-y-2 mb-6">{order.map((id: string, idx: number) => (
        <div key={id} className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5">
          <span className="text-[10px] text-neon-cyan/60 w-6 text-center font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>{idx + 1}</span>
          <span className="flex-1 text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{itemMap.get(id) || id}</span>
          <div className="flex gap-1">
            <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded-lg text-[9px] border border-white/10 text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed" style={{ fontFamily: "'Orbitron', sans-serif" }}>▲</button>
            <button onClick={() => moveItem(idx, 1)} disabled={idx === order.length - 1} className="px-2 py-1 rounded-lg text-[9px] border border-white/10 text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed" style={{ fontFamily: "'Orbitron', sans-serif" }}>▼</button>
          </div>
        </div>
      ))}</div>
      <button onClick={handleConfirm} disabled={order.length === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SopaDeLetras
// ═══════════════════════════════════════════════════════════════
function SopaDeLetrasPlay({ question, found, setFound, timeLimitSec, onSubmit, submitting }: any) {
  const words: string[] = question?.words || [];
  const gridSize: number = question?.gridSize || 12;
  const [gridData] = useState(() => {
    const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    const solution = new Map<string, { row: number; col: number }[]>();
    const sorted = [...words].sort((a, b) => b.length - a.length);
    const dirs: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    for (const word of sorted) {
      const uw = word.toUpperCase(); let placed = false; let tries = 0;
      while (!placed && tries < 500) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const sr = Math.floor(Math.random() * gridSize);
        const sc = Math.floor(Math.random() * gridSize);
        let ok = true; const positions: { row: number; col: number }[] = [];
        for (let i = 0; i < uw.length; i++) {
          const r = sr + dr * i; const c = sc + dc * i;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) { ok = false; break; }
          if (grid[r][c] !== '' && grid[r][c] !== uw[i]) { ok = false; break; }
          positions.push({ row: r, col: c });
        }
        if (ok) { positions.forEach((pos, i) => { grid[pos.row][pos.col] = uw[i]; }); solution.set(uw, positions); placed = true; }
        tries++;
      }
    }
    for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) if (grid[r][c] === '') grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return { grid, solution };
  });
  const { grid, solution } = gridData;
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitSec ? timeLimitSec : null);
  const [showResults, setShowResults] = useState(false);
  const [usedTime, setUsedTime] = useState(0);
  const isPointerDown = useRef(false);
  const dragSelectionRef = useRef<Set<string>>(new Set());
  const pointerStartCell = useRef<string | null>(null);
  const hasDragged = useRef(false);
  const suppressClickRef = useRef(false);
  const foundCells = new Set<string>();
  for (const w of found) {
    const positions = solution.get(w.toUpperCase());
    if (positions) for (const pos of positions) foundCells.add(`${pos.row},${pos.col}`);
  }
  useEffect(() => {
    if (timeLeft === null || showResults) return;
    const id = setInterval(() => { setTimeLeft((t) => { if (t === null || t <= 1) { setShowResults(true); setUsedTime(timeLimitSec || 0); return 0; } return t - 1; }); }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, showResults, timeLimitSec]);
  useEffect(() => { if (showResults && timeLimitSec && timeLeft !== null) setUsedTime(timeLimitSec - timeLeft); }, [showResults, timeLimitSec, timeLeft]);
  // ... (simplified drag logic as in original, kept minimal for brevity)
  function handleCellClick(row: number, col: number) {
    const key = `${row},${col}`;
    const next = new Set(selectedCells);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelectedCells(next);
    if (next.size >= 2) {
      const foundWord = matchWord(Array.from(next).map(s => { const [r, c] = s.split(',').map(Number); return { row: r, col: c }; }), grid, words, found);
      if (foundWord) { setFound([...found, foundWord]); setSelectedCells(new Set()); }
    }
  }
  function handleFinish() { setShowResults(true); }
  function matchWord(positions: { row: number; col: number }[], g: string[][], wordList: string[], foundList: string[]): string | null {
    if (positions.length < 2) return null;
    const first = positions[0]; let sorted = positions;
    if (positions.every(p => p.row === first.row)) sorted = positions.sort((a, b) => a.col - b.col);
    else if (positions.every(p => p.col === first.col)) sorted = positions.sort((a, b) => a.row - b.row);
    else if (positions.every(p => p.row - p.col === first.row - first.col)) sorted = positions.sort((a, b) => a.row - b.row);
    else if (positions.every(p => p.row + p.col === first.row + first.col)) sorted = positions.sort((a, b) => a.row - b.row);
    else return null;
    for (let i = 1; i < sorted.length; i++) if (Math.abs(sorted[i].row - sorted[i-1].row) > 1 || Math.abs(sorted[i].col - sorted[i-1].col) > 1) return null;
    const word = sorted.map(p => g[p.row][p.col]).join('');
    const upper = word.toUpperCase();
    const reversed = upper.split('').reverse().join('');
    for (const target of wordList) { const ut = target.toUpperCase(); if (!foundList.includes(target) && (upper === ut || reversed === ut)) return target; }
    return null;
  }
  if (showResults) {
    const allFound = found.length >= words.length;
    return (
      <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', borderColor: allFound ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)', boxShadow: allFound ? '0 0 20px rgba(0,255,100,0.15)' : '0 0 20px rgba(255,0,110,0.15)' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{allFound ? '🎉' : '😅'}</div>
          <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: allFound ? '#00FF64' : '#FF006E' }}>{allFound ? 'SOPA COMPLETADA' : 'TIEMPO TERMINADO'}</h2>
          <p className="text-[10px] text-purple-300/50 tracking-wider mt-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>{found.length} DE {words.length} PALABRAS ENCONTRADAS</p>
        </div>
        <button onClick={onSubmit} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 neon-border-cyan" style={{ borderRadius: '24px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] text-purple-300/50 tracking-[3px]" style={{ fontFamily: "'Orbitron', sans-serif" }}>SOPA DE LETRAS — {question?.topic || 'GENERAL'}</div>
        {timeLeft !== null && <div className={`text-xs font-bold tracking-wider px-3 py-1 rounded-lg ${timeLeft <= 10 ? 'animate-pulse' : ''}`} style={{ fontFamily: "'Press Start 2P', monospace", color: timeLeft <= 10 ? '#FF006E' : '#00F5FF', background: timeLeft <= 10 ? 'rgba(255,0,110,0.15)' : 'rgba(0,245,255,0.1)', border: `1px solid ${timeLeft <= 10 ? 'rgba(255,0,110,0.3)' : 'rgba(0,245,255,0.2)'}` }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>}
      </div>
      <div className="text-center mb-4">
        <div className="text-xs text-purple-300/50 tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>PALABRAS A ENCONTRAR ({found.length}/{words.length})</div>
        <div className="flex flex-wrap gap-2 justify-center mb-3">{words.map(w => <span key={w} className={`px-3 py-1 rounded-lg text-[9px] tracking-wider uppercase transition-all ${found.includes(w) ? 'text-green-400 line-through opacity-70' : 'text-purple-300/70 border border-purple-400/30'}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>{w}</span>)}</div>
      </div>
      <div className="mx-auto mb-6 select-none" style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, maxWidth: `${Math.min(gridSize * 44, 600)}px`, gap: '1px', touchAction: 'none' }}>
        {grid.map((row: string[], ri: number) => row.map((cell: string, ci: number) => {
          const key = `${ri},${ci}`;
          const isFound = foundCells.has(key);
          const isSelected = selectedCells.has(key);
          let bgColor = 'rgba(255,255,255,0.03)', textColor = 'rgba(255,255,255,0.6)', borderColor = 'rgba(0,245,255,0.12)';
          if (isFound) { bgColor = 'rgba(0,255,100,0.18)'; textColor = '#00FF64'; borderColor = 'rgba(0,255,100,0.35)'; }
          else if (isSelected) { bgColor = 'rgba(0,245,255,0.25)'; textColor = '#00F5FF'; borderColor = 'rgba(0,245,255,0.7)'; }
          const fontSize = gridSize > 14 ? '8px' : gridSize > 10 ? '10px' : gridSize > 8 ? '11px' : '13px';
          return <div key={key} onClick={() => { if (!isFound) handleCellClick(ri, ci); }} style={{ background: bgColor, color: textColor, border: `1px solid ${borderColor}`, fontFamily: "'Press Start 2P', monospace", fontSize, padding: '2px', aspectRatio: '1', cursor: isFound ? 'default' : 'crosshair', transition: 'all 0.08s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', fontWeight: isFound || isSelected ? 'bold' : 'normal', textShadow: isFound ? '0 0 6px rgba(0,255,100,0.5)' : isSelected ? '0 0 6px rgba(0,245,255,0.5)' : 'none', borderRadius: '2px' }}>{cell}</div>;
        }))}
      </div>
      <div className="flex gap-3">
        <button onClick={handleFinish} disabled={found.length === 0} className="flex-1 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: found.length >= words.length ? 'linear-gradient(135deg, #00FF64, #009944)' : 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: found.length >= words.length ? '0 0 15px rgba(0,255,100,0.3)' : '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{found.length >= words.length ? '✓ COMPLETADO' : `FINALIZAR (${found.length}/${words.length})`}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MemoriaPlay — Memory card matching game
// ═══════════════════════════════════════════════════════════════
function MemoriaPlay({ question, flipped, setFlipped, matched, setMatched, onComplete, submitting }: any) {
  const cards: { id: string; content: string; matchId: string }[] = question?.pairs || [];
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [pairResults, setPairResults] = useState<{ matchId: string; card1: string; card2: string; ok: boolean }[]>([]);
  const [memStartTime] = useState(Date.now());
  const uniquePairs = useMemo(() => {
    const seen = new Set<string>();
    const result: { matchId: string; card1: string; card2: string }[] = [];
    cards.forEach(c => { if (!seen.has(c.matchId)) { seen.add(c.matchId); const pair = cards.filter(p => p.matchId === c.matchId); if (pair.length === 2) result.push({ matchId: c.matchId, card1: pair[0].content, card2: pair[1].content }); } });
    return result;
  }, [cards]);
  function handleFlip(cardId: string) {
    if (showResult || matched.has(cardId) || flipped.has(cardId)) return;
    if (selected === null) { setSelected(cardId); setFlipped(new Set(Array.from(flipped).concat([cardId]))); }
    else {
      setAttempts(a => a + 1);
      const newFlipped = new Set(flipped); newFlipped.add(cardId); setFlipped(newFlipped);
      const firstCard = cards.find(c => c.id === selected);
      const secondCard = cards.find(c => c.id === cardId);
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        const newMatched = new Set(matched); newMatched.add(selected); newMatched.add(cardId);
        setMatched(newMatched); setSelected(null);
        setFlipped(new Set(Array.from(newFlipped).filter(id => newMatched.has(id))));
      } else {
        setTimeout(() => { setFlipped(new Set(Array.from(flipped).filter(id => matched.has(id)))); setSelected(null); }, 700);
      }
    }
  }
  function handleFinish() {
    const pr = uniquePairs.map(p => { const pairCards = cards.filter(c => c.matchId === p.matchId); const bothMatched = pairCards.every(c => matched.has(c.id)); return { ...p, ok: bothMatched }; });
    setPairResults(pr); setShowResult(true);
  }
  if (showResult) {
    const elapsed = Date.now() - memStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const correctCount = pairResults.filter(r => r.ok).length;
    const allOk = correctCount === pairResults.length;
    return (
      <div className="glass rounded-2xl p-8 neon-border-yellow space-y-4" style={{ borderRadius: '24px' }}>
        <div className="text-center">
          <div className="text-5xl mb-2">{allOk ? '🎉' : '😅'}</div>
          <h2 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: allOk ? '#00FF64' : '#FF006E' }}>{allOk ? 'MEMORIA COMPLETADA' : 'FINALIZADO'}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-lg font-bold text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace" }}>{correctCount}/{pairResults.length}</div><div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>PAREJAS</div></div>
          <div><div className="text-lg font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: '#FFD60A' }}>{minutes}:{secs.toString().padStart(2, '0')}</div><div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>TIEMPO</div></div>
          <div><div className="text-lg font-bold text-neon-pink" style={{ fontFamily: "'Press Start 2P', monospace" }}>{attempts}</div><div className="text-[8px] text-purple-400/40 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>INTENTOS</div></div>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,214,10,0.3), transparent)' }} />
        <div className="space-y-2">{pairResults.map((p) => (
          <div key={p.matchId} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: p.ok ? 'rgba(0,255,100,0.3)' : 'rgba(255,0,110,0.3)', background: p.ok ? 'rgba(0,255,100,0.06)' : 'rgba(255,0,110,0.06)' }}>
            <span className="text-[9px]" style={{ fontFamily: "'Press Start 2P', monospace", color: p.ok ? '#00FF64' : '#FF006E' }}>{p.ok ? '✓' : '✗'}</span>
            <span className="flex-1 text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}><span className="text-neon-cyan">{p.card1}</span><span className="mx-2 text-purple-400/40">↔</span><span className="text-neon-yellow">{p.card2}</span></span>
          </div>
        ))}</div>
        <button onClick={() => { const answerPayload: Record<string, string> = {}; cards.forEach(c => { if (matched.has(c.id)) answerPayload[c.id] = c.matchId; }); onComplete(answerPayload); }} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 neon-border-yellow" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>MEMORIA — ENCUENTRA LAS PAREJAS ({matched.size}/{cards.length})</div>
      <div className="grid grid-cols-4 gap-3 mb-6">{cards.map((card) => {
        const isFlipped = flipped.has(card.id) || matched.has(card.id);
        return <button key={card.id} onClick={() => handleFlip(card.id)} disabled={matched.has(card.id)} className={`aspect-square rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${isFlipped ? 'neon-border-cyan' : 'border border-white/10 hover:border-white/30'}`} style={{ fontFamily: "'Press Start 2P', monospace", background: isFlipped ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.03)', color: isFlipped ? '#00F5FF' : 'rgba(255,255,255,0.3)', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>{isFlipped ? card.content : '?'}</button>;
      })}</div>
      <button onClick={handleFinish} disabled={matched.size === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FFD60A, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,214,10,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{matched.size === cards.length ? '✓ COMPLETADO' : `FINALIZAR (${matched.size}/${cards.length})`}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CrucigramaPlay — Crossword puzzle
// ═══════════════════════════════════════════════════════════════
function CrucigramaPlay({ question, answers, setAnswers, onSubmit, submitting }: any) {
  const clues: { answer: string; clue: string; x: number; y: number; direction: 'across' | 'down' }[] = question?.clues || [];
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { grid } = useMemo(() => {
    if (!clues.length) return { grid: [['']] };
    let maxX = 0, maxY = 0;
    clues.forEach((clue, idx) => { for (let i = 0; i < clue.answer.length; i++) { const cx = clue.direction === 'across' ? clue.x + i : clue.x; const cy = clue.direction === 'down' ? clue.y + i : clue.y; maxX = Math.max(maxX, cx); maxY = Math.max(maxY, cy); } });
    const rows = maxY + 1; const cols = maxX + 1;
    const g: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
    clues.forEach((clue) => { for (let i = 0; i < clue.answer.length; i++) { const cx = clue.direction === 'across' ? clue.x + i : clue.x; const cy = clue.direction === 'down' ? clue.y + i : clue.y; g[cy][cx] = g[cy][cx] || clue.answer[i]; } });
    return { grid: g };
  }, [clues]);
  const cellNumbers = useMemo(() => { const nums = new Map<string, number>(); let n = 1; clues.forEach((clue) => { const key = `${clue.x},${clue.y}`; if (!nums.has(key)) nums.set(key, n++); }); return nums; }, [clues]);
  const acrossClues = clues.filter(c => c.direction === 'across');
  const downClues = clues.filter(c => c.direction === 'down');
  function handleCellInput(x: number, y: number, value: string) { setAnswers({ ...answers, [`${x},${y}`]: value.toUpperCase() }); }
  function handleFinish() { setShowResult(true); }
  function checkResults() {
    let correct = 0;
    const total = clues.reduce((sum, c) => sum + c.answer.length, 0);
    clues.forEach((clue) => {
      for (let i = 0; i < clue.answer.length; i++) { const cx = clue.direction === 'across' ? clue.x + i : clue.x; const cy = clue.direction === 'down' ? clue.y + i : clue.y; const userAns = (answers[`${cx},${cy}`] || '').toUpperCase(); const correctChar = clue.answer[i].toUpperCase(); if (userAns === correctChar) correct++; }
    });
    return { correct, total };
  }
  function handleContinue() { setShowResult(false); setAnswers({}); onSubmit(); }
  if (showResult) {
    const { correct, total } = checkResults();
    const allCorrect = correct === total;
    return (
      <div className="glass rounded-2xl p-8 neon-border-magenta space-y-4" style={{ borderRadius: '24px' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">{allCorrect ? '🎉' : '✗'}</div>
          <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: allCorrect ? '#00FF64' : '#FF006E' }}>{allCorrect ? 'CRUCIGRAMA COMPLETADO' : 'INCORRECTO'}</h2>
          <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{correct} DE {total} LETRAS CORRECTAS</p>
        </div>
        <button onClick={handleContinue} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 neon-border-magenta" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>CRUCIGRAMA — RESUELVE LAS PALABRAS CRUZADAS</div>
      <div className="overflow-x-auto mb-6">
        <div className="mx-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0]?.length || 1}, minmax(0, 1fr))`, maxWidth: `${Math.min((grid[0]?.length || 1) * 44, 500)}px`, gap: '1px' }}>
          {grid.map((row, ri) => row.map((cell, ci) => {
            const key = `${ci},${ri}`;
            const isActive = grid[ri][ci] !== '';
            const num = cellNumbers.get(key);
            const userVal = answers[key] || '';
            return <div key={key} style={{ background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {num && <span style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '6px', color: 'rgba(0,245,255,0.6)', fontFamily: "'Press Start 2P', monospace" }}>{num}</span>}
              {isActive ? <input value={userVal} onChange={(e) => handleCellInput(ci, ri, e.target.value)} maxLength={1} className="w-full h-full text-center bg-transparent text-white font-bold outline-none uppercase" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(10px, 2.5vw, 16px)' }} autoComplete="off" /> : null}
            </div>;
          }))}
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {acrossClues.length > 0 && <div><div className="text-[9px] text-neon-cyan tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>HORIZONTALES</div>{acrossClues.map((clue, idx) => { const ci = clues.indexOf(clue); return <button key={idx} onClick={() => setActiveClue(ci)} className={`w-full text-left p-2 rounded-lg text-[10px] tracking-wider transition-all mb-1 ${activeClue === ci ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ fontFamily: "'Orbitron', sans-serif", background: activeClue === ci ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.7)' }}><span className="text-neon-cyan mr-2">{cellNumbers.get(`${clue.x},${clue.y}`) || '?'}.</span> {clue.clue}</button>; })}</div>}
        {downClues.length > 0 && <div><div className="text-[9px] text-neon-pink tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>VERTICALES</div>{downClues.map((clue, idx) => { const ci = clues.indexOf(clue); return <button key={idx} onClick={() => setActiveClue(ci)} className={`w-full text-left p-2 rounded-lg text-[10px] tracking-wider transition-all mb-1 ${activeClue === ci ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ fontFamily: "'Orbitron', sans-serif", background: activeClue === ci ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.7)' }}><span className="text-neon-pink mr-2">{cellNumbers.get(`${clue.x},${clue.y}`) || '?'}.</span> {clue.clue}</button>; })}</div>}
      </div>
      <button onClick={handleFinish} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF00FF, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CompletarEspaciosPlay — Fill in the blanks
// ═══════════════════════════════════════════════════════════════
function CompletarEspaciosPlay({ question, answers, setAnswers, onSubmit, submitting }: any) {
  const text: string = question?.text || '';
  const blanks: { index: number; correctAnswer: string; placeholder?: string }[] = question?.blanks || [];
  const [showResult, setShowResult] = useState(false);
  const segments = useMemo(() => {
    if (!text && !blanks.length) return [];
    const parts: { type: 'text' | 'blank'; content: string; blankIndex?: number }[] = [];
    if (!text) { blanks.forEach((b) => { parts.push({ type: 'blank', content: '', blankIndex: b.index }); }); return parts; }
    const splitBy = '_____';
    const textParts = text.split(splitBy);
    textParts.forEach((part, i) => { if (part) parts.push({ type: 'text' as const, content: part }); if (i < blanks.length) parts.push({ type: 'blank' as const, content: '', blankIndex: blanks[i].index }); });
    return parts;
  }, [text, blanks]);
  function handleBlankInput(idx: number, value: string) { const copy = [...answers]; copy[idx] = value; setAnswers(copy); }
  function handleFinish() { setShowResult(true); }
  function checkResults() { let correct = 0; const results: boolean[] = []; blanks.forEach((b, i) => { const ok = (answers[i] || '').toLowerCase().trim() === b.correctAnswer.toLowerCase().trim(); if (ok) correct++; results.push(ok); }); return { correct, total: blanks.length, results }; }
  if (showResult) {
    const { correct, total, results } = checkResults();
    const allCorrect = correct === total;
    return (
      <div className="glass rounded-2xl p-8 neon-border-cyan space-y-4" style={{ borderRadius: '24px' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">{allCorrect ? '🎉' : '✗'}</div>
          <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', monospace", color: allCorrect ? '#00FF64' : '#FF006E' }}>{allCorrect ? 'COMPLETADO' : 'INCORRECTO'}</h2>
          <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{correct} DE {total} CORRECTAS</p>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />
        <div className="space-y-2">{blanks.map((b, i) => {
          const ok = results[i];
          return <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: ok ? 'rgba(0,255,100,0.3)' : 'rgba(255,0,110,0.3)', background: ok ? 'rgba(0,255,100,0.06)' : 'rgba(255,0,110,0.06)' }}>
            <span className="text-[9px]" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? '✓' : '✗'}</span>
            <span className="flex-1 text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}><span className="text-neon-cyan">#{b.index + 1}</span> — <span className={ok ? 'text-green-400' : 'text-neon-pink'}>{answers[i] || '(vacío)'}</span></span>
            {!ok && <span className="text-[8px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>SE ESPERABA: {b.correctAnswer}</span>}
          </div>;
        })}</div>
        <button onClick={() => { setShowResult(false); onSubmit(); }} disabled={submitting} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>{submitting ? 'ENVIANDO...' : 'CONTINUAR →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 neon-border-cyan" style={{ borderRadius: '24px' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>COMPLETAR ESPACIOS — LLENA LOS HUECOS EN EL TEXTO</div>
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5 text-sm leading-relaxed tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", lineHeight: '2.2', color: 'rgba(255,255,255,0.7)' }}>
        {segments.length > 0 ? segments.map((seg, i) => {
          if (seg.type === 'text') return <span key={i}>{seg.content}</span>;
          return <input key={i} value={answers[seg.blankIndex!] || ''} onChange={(e) => handleBlankInput(seg.blankIndex!, e.target.value)} placeholder={blanks[seg.blankIndex!]?.placeholder || '...'} className="inline-block mx-1 px-2 py-1 rounded-lg bg-white/10 border border-neon-cyan/30 text-neon-cyan text-xs text-center font-bold outline-none uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace", width: '120px', fontSize: '10px' }} autoComplete="off" />;
        }) : (
          <div className="space-y-4">{blanks.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] text-neon-cyan tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>#{i + 1}</span>
              <input value={answers[i] || ''} onChange={(e) => handleBlankInput(i, e.target.value)} placeholder={b.placeholder || 'RESPUESTA'} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }} autoComplete="off" />
            </div>
          ))}</div>
        )}
      </div>
      <button onClick={handleFinish} disabled={answers.length === 0 || answers.every((a: string) => !a?.trim())} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(0,245,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SecuenciaPlay — Sequence of games
// ═══════════════════════════════════════════════════════════════

function SecuenciaPlay({ question, submitting }: any) {
  const steps: Array<{ templateType: string; title: string; content: any; rules?: any }> = question?.steps || [];
  const topic: string = question?.topic || '';
  const [stepIndex, setStepIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [stepResults, setStepResults] = useState<{ title: string; templateType: string; score: number; ok: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(false);
  const [stepStartTime] = useState(Date.now());

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  async function handleStepAnswer(answerPayload: unknown) {
    if (!step || submittingStep) return;
    setSubmittingStep(true);
    const elapsedMs = Date.now() - stepStartTime;
    try {
      const token = localStorage.getItem('token');
      const gameId = window.location.pathname.split('/').pop();
      const res = await fetch(`/api/sessions/${gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionIndex: stepIndex, answer: answerPayload, elapsedMs }),
      });
      const result = await res.json().catch(() => ({ isCorrect: false, scoreDelta: 0 }));
      const isCorrect = result.isCorrect ?? false;
      const scoreDelta = result.scoreDelta ?? 0;

      const newResults = [...stepResults, { title: step.title, templateType: step.templateType, score: scoreDelta, ok: isCorrect }];
      setStepResults(newResults);
      setTotalScore(s => s + scoreDelta);

      if (isLast) { setFinished(true); }
      else { setStepIndex(stepIndex + 1); }
    } catch {
      if (isLast) { setFinished(true); }
      else { setStepIndex(stepIndex + 1); }
    } finally {
      setSubmittingStep(false);
    }
  }

  if (finished) {
    const correctCount = stepResults.filter(r => r.ok).length;
    const pct = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0;
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return (
      <div className="glass rounded-2xl p-8 neon-border-cyan text-center space-y-5" style={{ borderRadius: '24px' }}>
        <div className="text-5xl mb-2 animate-float" style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>▲</div>
        <h2 className="text-base font-bold" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(90deg, #FFD60A, #FF006E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SECUENCIA COMPLETADA</h2>
        <div className="text-4xl font-bold" style={{ color: '#FFD60A', fontFamily: "'Press Start 2P', monospace" }}>{totalScore}</div>
        <div className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>PUNTOS TOTALES</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-lg font-bold text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace" }}>{correctCount}/{steps.length}</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>CORRECTOS</div></div>
          <div><div className="text-lg font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: pct >= 70 ? '#00FF64' : '#FF006E' }}>{pct}%</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>PRECISION</div></div>
          <div><div className="text-lg font-bold text-neon-yellow" style={{ fontFamily: "'Press Start 2P', monospace" }}>{minutes}:{seconds.toString().padStart(2, '0')}</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>TIEMPO</div></div>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />
        <div className="space-y-2">{stepResults.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: r.ok ? 'rgba(0,255,100,0.3)' : 'rgba(255,0,110,0.3)', background: r.ok ? 'rgba(0,255,100,0.06)' : 'rgba(255,0,110,0.06)' }}>
            <span className="text-[9px]" style={{ fontFamily: "'Press Start 2P', monospace", color: r.ok ? '#00FF64' : '#FF006E' }}>{r.ok ? '✓' : '✗'}</span>
            <span className="flex-1 text-left"><div className="text-[10px] text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{r.title}</div><div className="text-[8px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{r.templateType}</div></span>
            <span className="text-xs font-bold text-neon-yellow" style={{ fontFamily: "'Press Start 2P', monospace" }}>+{r.score}</span>
          </div>
        ))}</div>
        <button onClick={() => window.location.href = '/games'} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>VOLVER A JUEGOS →</button>
      </div>
    );
  }

  if (!step) {
    return <div className="glass rounded-2xl p-8 text-center neon-border-pink" style={{ borderRadius: '24px' }}><div className="text-sm text-neon-pink tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>ERROR: SECUENCIA VACIA</div></div>;
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{topic && <>{topic} — </>}{stepIndex + 1} DE {steps.length}</div>
          <div className="text-[10px] font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: '#FFD60A' }}>{totalScore}</div>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${((stepIndex) / steps.length) * 100}%`, background: 'linear-gradient(90deg, #00F5FF, #7B2FBE)' }} /></div>
        <div className="flex justify-between mt-1">{steps.map((_, i) => <div key={i} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: i < stepIndex ? '#00F5FF' : i === stepIndex ? '#FFD60A' : 'rgba(255,255,255,0.1)' }} />)}</div>
      </div>
      <div className="text-center mb-4">
        <div className="text-[9px] text-neon-cyan/60 tracking-[3px] uppercase mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{step.templateType}</div>
        <h2 className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{step.title || step.templateType}</h2>
      </div>
      {step.templateType === 'SiONo' && <SimpleSiONoPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'OpcionMultiple' && <SimpleOpcionMultiplePlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'MultiSeleccion' && <SimpleMultiSeleccionPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'RelacionarColumnas' && <SimpleRelacionarColumnasPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'OrdenarSecuencia' && <SimpleOrdenarSecuenciaPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'SopaDeLetras' && <SimpleSopaDeLetrasPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'Memoria' && <SimpleMemoriaPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'Crucigrama' && <SimpleCrucigramaPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
      {step.templateType === 'CompletarEspacios' && <SimpleCompletarEspaciosPlay step={step} onSubmit={handleStepAnswer} submitting={submittingStep} />}
    </div>
  );
}

// ─── Simple game renders for sequence steps ────────────────────

function SimpleSiONoPlay({ step, onSubmit, submitting }: any) {
  const questions: { prompt: string; answer: boolean }[] = step.content?.questions || [];
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const q = questions[qi];
  function handleConfirm() { setShowResult(true); }
  function handleContinue() {
    setShowResult(false); setSelected(null);
    if (qi + 1 >= questions.length) onSubmit({ questionIndex: qi, answer: selected });
    else setQi(qi + 1);
  }
  if (showResult) {
    const ok = selected === q.answer;
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: ok ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
        <div className="text-4xl">{ok ? '✓' : '✗'}</div>
        <h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? 'CORRECTO' : 'INCORRECTO'}</h3>
        <p className="text-[10px] text-purple-300/50">Respuesta: {q.answer ? 'VERDADERO' : 'FALSO'}</p>
        <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{qi + 1 >= questions.length ? 'FINALIZAR PASO →' : 'SIGUIENTE →'}</button>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-8 text-center" style={{ borderRadius: '24px', border: '1px solid rgba(0,245,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4">PREGUNTA {qi + 1}</div>
      <h2 className="text-base font-bold text-white mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>{q?.prompt}</h2>
      <div className="flex gap-4 justify-center mb-6">
        <button onClick={() => setSelected(true)} className={`px-6 py-3 rounded-xl text-xs font-bold tracking-widest ${selected === true ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ background: selected === true ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)' }}>VERDADERO</button>
        <button onClick={() => setSelected(false)} className={`px-6 py-3 rounded-xl text-xs font-bold tracking-widest ${selected === false ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ background: selected === false ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)' }}>FALSO</button>
      </div>
      {selected !== null && <button onClick={handleConfirm} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONFIRMAR →</button>}
    </div>
  );
}

function SimpleOpcionMultiplePlay({ step, onSubmit, submitting }: any) {
  const questions: { prompt: string; options: string[]; correctIndex: number }[] = step.content?.questions || [];
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const q = questions[qi];
  function handleConfirm() { setShowResult(true); }
  function handleContinue() { setShowResult(false); setSelected(null); if (qi + 1 >= questions.length) onSubmit({ questionIndex: qi, answer: selected }); else setQi(qi + 1); }
  if (showResult) { const ok = selected === q.correctIndex; return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: ok ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{ok ? '✓' : '✗'}</div>
      <h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? 'CORRECTO' : 'INCORRECTO'}</h3>
      {!ok && <p className="text-[10px] text-purple-300/50">Correcta: {q.options[q.correctIndex]}</p>}
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{qi + 1 >= questions.length ? 'FINALIZAR PASO →' : 'SIGUIENTE →'}</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(123,47,190,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">PREGUNTA {qi + 1}</div>
      <h2 className="text-base font-bold text-white mb-6 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>{q?.prompt}</h2>
      <div className="space-y-3 mb-6">{q?.options?.map((opt, i) => <button key={i} onClick={() => setSelected(i)} className={`w-full text-left p-3 rounded-xl text-xs tracking-wider ${selected === i ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ background: selected === i ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)' }}><span className="mr-2 text-neon-cyan/50">{String.fromCharCode(65 + i)}</span> {opt}</button>)}</div>
      {selected !== null && <button onClick={handleConfirm} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONFIRMAR →</button>}
    </div>
  );
}

function SimpleMultiSeleccionPlay({ step, onSubmit, submitting }: any) {
  const questions: { prompt: string; options: { text: string; correct: boolean }[] }[] = step.content?.questions || [];
  const [qi, setQi] = useState(0); const [selected, setSelected] = useState<number[]>([]); const [showResult, setShowResult] = useState(false);
  const q = questions[qi]; function toggle(i: number) { setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]); }
  function handleConfirm() { setShowResult(true); }
  function handleContinue() { setShowResult(false); setSelected([]); if (qi + 1 >= questions.length) onSubmit({ questionIndex: qi, answer: selected }); else setQi(qi + 1); }
  if (showResult) { const correctSelected = q.options.filter((o, i) => o.correct === selected.includes(i)).length; const ok = correctSelected === q.options.length; return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: ok ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{ok ? '✓' : '✗'}</div>
      <h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: ok ? '#00FF64' : '#FF006E' }}>{ok ? 'CORRECTO' : 'INCORRECTO'}</h3>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{qi + 1 >= questions.length ? 'FINALIZAR PASO →' : 'SIGUIENTE →'}</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(0,245,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4">PREGUNTA {qi + 1}</div>
      <h2 className="text-base font-bold text-white mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>{q?.prompt}</h2>
      <div className="space-y-3 mb-6">{q?.options?.map((opt, i) => <button key={i} onClick={() => toggle(i)} className={`w-full text-left p-3 rounded-xl text-xs tracking-wider ${selected.includes(i) ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ background: selected.includes(i) ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)' }}><span className={`mr-2 inline-block w-4 h-4 rounded border text-center text-[8px] leading-4 ${selected.includes(i) ? 'border-neon-cyan bg-neon-cyan/20' : 'border-white/20'}`}>{selected.includes(i) ? '✓' : ''}</span>{opt.text}</button>)}</div>
      <button onClick={handleConfirm} disabled={selected.length === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONFIRMAR →</button>
    </div>
  );
}

function SimpleRelacionarColumnasPlay({ step, onSubmit, submitting }: any) {
  const pairs: { left: string; right: string }[] = step.content?.pairs || [];
  const [mapping, setMapping] = useState<Record<number, number>>({}); const [selectedLeft, setSelectedLeft] = useState<number | null>(null); const [submitted, setSubmitted] = useState(false);
  function handleLeftClick(i: number) { if (!submitted) setSelectedLeft(selectedLeft === i ? null : i); }
  function handleRightClick(i: number) { if (submitted) return; if (selectedLeft !== null) { const newMap = { ...mapping }; Object.keys(newMap).forEach(k => { if (newMap[Number(k)] === i) delete newMap[Number(k)]; }); newMap[selectedLeft] = i; setMapping(newMap); setSelectedLeft(null); } }
  function handleConfirm() { setSubmitted(true); }
  function handleContinue() { const result: Record<number, number> = {}; Object.entries(mapping).forEach(([k, v]) => { result[Number(k)] = v; }); onSubmit({ mappings: result }); }
  const allMapped = Object.keys(mapping).length === pairs.length;
  if (submitted) { const correct = pairs.filter((_, i) => mapping[i] === i).length; const allOk = correct === pairs.length; return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: allOk ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{allOk ? '✓' : '✗'}</div><h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: allOk ? '#00FF64' : '#FF006E' }}>{allOk ? 'CORRECTO' : 'INCORRECTO'}</h3>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(255,214,10,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">RELACIONAR</div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">{pairs.map((p, i) => <button key={i} onClick={() => handleLeftClick(i)} className={`w-full p-3 rounded-xl text-xs tracking-wider ${selectedLeft === i ? 'neon-border-cyan' : mapping[i] !== undefined ? 'border-2 border-neon-cyan/50' : 'border border-white/10'}`} style={{ background: mapping[i] !== undefined ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)' }}>{p.left}</button>)}</div>
        <div className="space-y-2">{pairs.map((p, i) => { const isMapped = Object.values(mapping).includes(i); return <button key={i} onClick={() => handleRightClick(i)} className={`w-full p-3 rounded-xl text-xs tracking-wider ${isMapped ? 'border-2 border-neon-cyan/50' : selectedLeft !== null ? 'border border-white/30' : 'border border-white/10'}`} style={{ background: isMapped ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)' }}>{p.right}</button>; })}</div>
      </div>
      <button onClick={handleConfirm} disabled={!allMapped} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FFD60A, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{allMapped ? 'VERIFICAR →' : `${pairs.length - Object.keys(mapping).length} MAS`}</button>
    </div>
  );
}

function SimpleOrdenarSecuenciaPlay({ step, onSubmit, submitting }: any) {
  const items: { id: string; text: string; correctOrder: number }[] = step.content?.items || [];
  const [order, setOrder] = useState<string[]>(() => items.map(i => i.id).sort(() => Math.random() - 0.5)); const [submitted, setSubmitted] = useState(false);
  const itemMap = new Map(items.map(i => [i.id, i.text]));
  const correctOrder = [...items].sort((a, b) => a.correctOrder - b.correctOrder).map(i => i.id);
  function moveItem(fromIdx: number, dir: -1 | 1) { const toIdx = fromIdx + dir; if (toIdx < 0 || toIdx >= order.length) return; const copy = [...order]; const [rm] = copy.splice(fromIdx, 1); copy.splice(toIdx, 0, rm); setOrder(copy); }
  function handleConfirm() { setSubmitted(true); }
  function handleContinue() { onSubmit({ order }); }
  if (submitted) { const results = order.map((id, idx) => correctOrder[idx] === id); const correctCount = results.filter(Boolean).length; const allOk = correctCount === items.length; return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: allOk ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{allOk ? '✓' : '✗'}</div><h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: allOk ? '#00FF64' : '#FF006E' }}>{allOk ? 'CORRECTO' : 'INCORRECTO'}</h3>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(255,0,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">ORDENAR</div>
      <div className="space-y-2 mb-6">{order.map((id, idx) => <div key={id} className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5"><span className="text-[10px] text-neon-cyan/60 w-6 text-center font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>{idx + 1}</span><span className="flex-1 text-xs text-white tracking-wider">{itemMap.get(id) || id}</span><button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="px-2 py-1 rounded text-[9px] border border-white/10 text-purple-300/50 hover:text-neon-cyan disabled:opacity-20">▲</button><button onClick={() => moveItem(idx, 1)} disabled={idx === order.length - 1} className="px-2 py-1 rounded text-[9px] border border-white/10 text-purple-300/50 hover:text-neon-cyan disabled:opacity-20">▼</button></div>)}</div>
      <button onClick={handleConfirm} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}

function SimpleSopaDeLetrasPlay({ step, onSubmit, submitting }: any) {
  const words: string[] = step.content?.words || []; const gridSize: number = step.content?.gridSize || 10;
  const [found, setFound] = useState<string[]>([]); const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { grid, solution } = useMemo(() => {
    const g: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    const sol = new Map<string, { row: number; col: number }[]>();
    const sorted = [...words].sort((a, b) => b.length - a.length);
    const dirs: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    for (const word of sorted) { const uw = word.toUpperCase(); let placed = false; let tries = 0; while (!placed && tries < 200) { const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)]; const sr = Math.floor(Math.random() * gridSize); const sc = Math.floor(Math.random() * gridSize); let ok = true; const positions: { row: number; col: number }[] = []; for (let i = 0; i < uw.length; i++) { const r = sr + dr * i; const c = sc + dc * i; if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) { ok = false; break; } if (g[r][c] !== '' && g[r][c] !== uw[i]) { ok = false; break; } positions.push({ row: r, col: c }); } if (ok) { positions.forEach((pos, i) => { g[pos.row][pos.col] = uw[i]; }); sol.set(uw, positions); placed = true; } tries++; } }
    for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) if (g[r][c] === '') g[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return { grid: g, solution: sol };
  }, []);

  // Build set of cells already part of found words
  const foundCells = new Set<string>();
  for (const w of found) {
    const pos = solution.get(w.toUpperCase());
    if (pos) for (const p of pos) foundCells.add(`${p.row},${p.col}`);
  }

  function toggleCell(row: number, col: number) {
    const key = `${row},${col}`;
    if (foundCells.has(key)) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);

    // Check selection for a word (2+ cells in a straight line)
    if (next.size >= 2) {
      const cells = Array.from(next).map(s => { const [r, c] = s.split(',').map(Number); return { row: r, col: c }; });
      const first = cells[0];

      // Determine if they form a straight line
      const isHorizontal = cells.every(p => p.row === first.row);
      const isVertical = cells.every(p => p.col === first.col);
      const isDiag1 = cells.every(p => p.row - p.col === first.row - first.col);
      const isDiag2 = cells.every(p => p.row + p.col === first.row + first.col);

      if (isHorizontal || isVertical || isDiag1 || isDiag2) {
        // Sort cells in order
        let sorted = [...cells];
        if (isHorizontal) sorted.sort((a, b) => a.col - b.col);
        else if (isVertical) sorted.sort((a, b) => a.row - b.row);
        else if (isDiag1) sorted.sort((a, b) => a.row - b.row);
        else if (isDiag2) sorted.sort((a, b) => a.row - b.row);

        // Check consecutive
        let consecutive = true;
        for (let i = 1; i < sorted.length; i++) {
          const dr = Math.abs(sorted[i].row - sorted[i-1].row);
          const dc = Math.abs(sorted[i].col - sorted[i-1].col);
          if (dr > 1 || dc > 1) { consecutive = false; break; }
        }

        if (consecutive) {
          const word = sorted.map(p => grid[p.row][p.col]).join('').toUpperCase();
          const reversed = word.split('').reverse().join('');
          for (const target of words) {
            const ut = target.toUpperCase();
            if (!found.includes(target) && (word === ut || reversed === ut)) {
              setFound([...found, target]);
              setSelected(new Set());
              return;
            }
          }
        }
      }
    }
  }

  function handleFinish() { setShowResult(true); }
  function handleContinue() { onSubmit({ foundWords: found }); }

  if (showResult) {
    return <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px' }}>
      <div className="text-4xl">{found.length >= words.length ? '🎉' : '😅'}</div>
      <h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: found.length >= words.length ? '#00FF64' : '#FF006E' }}>{found.length >= words.length ? 'COMPLETADO' : 'FINALIZADO'}</h3>
      <p className="text-[10px] text-purple-300/50">{found.length} DE {words.length} PALABRAS</p>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>;
  }

  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(0,245,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">SOPA ({found.length}/{words.length})</div>
      <div className="flex flex-wrap gap-1 justify-center mb-3">{words.map(w => <span key={w} className={`px-2 py-1 rounded text-[7px] uppercase tracking-wider ${found.includes(w) ? 'text-green-400 line-through opacity-70' : 'text-purple-300/70 border border-purple-400/30'}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>{w}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, maxWidth: `${Math.min(gridSize * 36, 450)}px`, gap: '1px', margin: '0 auto 12px' }}>
        {grid.map((row, ri) => row.map((cell, ci) => {
          const key = `${ri},${ci}`;
          const isFoundCell = foundCells.has(key);
          const isSelectedCell = selected.has(key);
          let bg = 'rgba(255,255,255,0.03)';
          let color = 'rgba(255,255,255,0.5)';
          let border = '1px solid rgba(255,255,255,0.1)';
          if (isFoundCell) { bg = 'rgba(0,255,100,0.18)'; color = '#00FF64'; border = '1px solid rgba(0,255,100,0.35)'; }
          else if (isSelectedCell) { bg = 'rgba(0,245,255,0.25)'; color = '#00F5FF'; border = '1px solid rgba(0,245,255,0.7)'; }
          return <div key={key} onClick={() => toggleCell(ri, ci)} style={{ background: bg, color, border, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Press Start 2P', monospace", fontSize: gridSize > 12 ? '6px' : '9px', textTransform: 'uppercase', cursor: isFoundCell ? 'default' : 'pointer', transition: 'all 0.08s ease', borderRadius: '2px' }}>{cell}</div>;
        }))}
      </div>
      <button onClick={handleFinish} disabled={found.length === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: found.length >= words.length ? 'linear-gradient(135deg, #00FF64, #009944)' : 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{found.length >= words.length ? '✓ COMPLETADO' : `FINALIZAR (${found.length}/${words.length})`}</button>
    </div>
  );
}

function SimpleMemoriaPlay({ step, onSubmit, submitting }: any) {
  const cards: { id: string; content: string; matchId: string }[] = step.content?.pairs || [];
  const [flipped, setFlipped] = useState<Set<string>>(new Set()); const [matched, setMatched] = useState<Set<string>>(new Set()); const [selected, setSelected] = useState<string | null>(null); const [showResult, setShowResult] = useState(false);
  function handleFlip(cardId: string) {
    if (showResult || matched.has(cardId) || flipped.has(cardId)) return;
    if (selected === null) { setSelected(cardId); setFlipped(new Set(Array.from(flipped).concat([cardId]))); }
    else { const newFlipped = new Set(flipped); newFlipped.add(cardId); setFlipped(newFlipped); const first = cards.find(c => c.id === selected); const second = cards.find(c => c.id === cardId); if (first && second && first.matchId === second.matchId) { const newMatched = new Set(matched); newMatched.add(selected); newMatched.add(cardId); setMatched(newMatched); setSelected(null); setFlipped(new Set(Array.from(newFlipped).filter(id => newMatched.has(id)))); if (newMatched.size === cards.length) setTimeout(() => setShowResult(true), 500); } else { setTimeout(() => { setFlipped(new Set(Array.from(flipped).filter(id => matched.has(id)))); setSelected(null); }, 700); } }
  }
  function handleFinish() { setShowResult(true); }
  if (showResult || matched.size === cards.length) { return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: matched.size === cards.length ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{matched.size === cards.length ? '🎉' : '😅'}</div>
      <h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: matched.size === cards.length ? '#00FF64' : '#FF006E' }}>{matched.size === cards.length ? 'COMPLETADO' : 'FINALIZADO'}</h3>
      <p className="text-[10px] text-purple-300/50">{matched.size} DE {cards.length}</p>
      <button onClick={() => { const payload: Record<string, string> = {}; cards.forEach(c => { if (matched.has(c.id)) payload[c.id] = c.matchId; }); onSubmit(payload); }} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(255,214,10,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">MEMORIA ({matched.size}/{cards.length})</div>
      <div className="grid grid-cols-4 gap-2 mb-6">{cards.map(card => { const f = flipped.has(card.id) || matched.has(card.id); return <button key={card.id} onClick={() => handleFlip(card.id)} disabled={matched.has(card.id)} className={`aspect-square rounded-xl text-[8px] font-bold tracking-wider transition-all ${f ? 'neon-border-cyan' : 'border border-white/10'}`} style={{ background: f ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.03)', color: f ? '#00F5FF' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px' }}>{f ? card.content : '?'}</button>; })}</div>
      <button onClick={handleFinish} disabled={matched.size === 0} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FFD60A, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{matched.size === cards.length ? '✓ COMPLETADO' : `FINALIZAR (${matched.size}/${cards.length})`}</button>
    </div>
  );
}

function SimpleCrucigramaPlay({ step, onSubmit, submitting }: any) {
  const clues: { answer: string; clue: string; x: number; y: number; direction: string }[] = step.content?.clues || [];
  const grid: string[][] = step.content?.grid || [['']]; const [answers, setAnswers] = useState<Record<string, string>>({}); const [showResult, setShowResult] = useState(false);
  function handleCellInput(x: number, y: number, value: string) { setAnswers({ ...answers, [`${x},${y}`]: value.toUpperCase() }); }
  const cellNumbers = useMemo(() => { const nums = new Map<string, number>(); let n = 1; clues.forEach(c => { const key = `${c.x},${c.y}`; if (!nums.has(key)) nums.set(key, n++); }); return nums; }, [clues]);
  function handleFinish() { setShowResult(true); } function handleContinue() { onSubmit(answers); }
  if (showResult) { let correct = 0, total = 0; clues.forEach(c => { for (let i = 0; i < c.answer.length; i++) { total++; const cx = c.direction === 'across' ? c.x + i : c.x; const cy = c.direction === 'down' ? c.y + i : c.y; if ((answers[`${cx},${cy}`] || '').toUpperCase() === c.answer[i].toUpperCase()) correct++; } }); const allOk = correct === total; return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: allOk ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{allOk ? '🎉' : '✗'}</div><h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: allOk ? '#00FF64' : '#FF006E' }}>{allOk ? 'COMPLETADO' : 'INCORRECTO'}</h3>
      <p className="text-[10px] text-purple-300/50">{correct} DE {total} LETRAS</p>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>
  ); }
  const cols = grid[0]?.length || 1;
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(255,0,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">CRUCIGRAMA</div>
      <div className="overflow-x-auto mb-4"><div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${Math.min(cols * 36, 360)}px`, gap: '1px', margin: '0 auto' }}>{grid.map((row, ri) => row.map((cell, ci) => { const key = `${ci},${ri}`; const isActive = grid[ri]?.[ci] !== ''; const num = cellNumbers.get(key); return <div key={key} style={{ background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{num && <span style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '5px', color: 'rgba(0,245,255,0.6)' }}>{num}</span>}{isActive ? <input value={answers[key] || ''} onChange={e => handleCellInput(ci, ri, e.target.value)} maxLength={1} className="w-full h-full text-center bg-transparent text-white font-bold outline-none uppercase" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '11px' }} /> : null}</div>; }))}</div></div>
      <div className="text-[8px] mb-4 text-purple-300/50">{clues.filter(c => c.direction === 'across').length > 0 && <div><span className="text-neon-cyan">H:</span> {clues.filter(c => c.direction === 'across').map((c, i) => `${cellNumbers.get(`${c.x},${c.y}`) || '?'}.${c.clue}`).join(' | ')}</div>}{clues.filter(c => c.direction === 'down').length > 0 && <div><span className="text-neon-pink">V:</span> {clues.filter(c => c.direction === 'down').map((c, i) => `${cellNumbers.get(`${c.x},${c.y}`) || '?'}.${c.clue}`).join(' | ')}</div>}</div>
      <button onClick={handleFinish} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF00FF, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}

function SimpleCompletarEspaciosPlay({ step, onSubmit, submitting }: any) {
  const blanks: { index: number; correctAnswer: string; placeholder?: string }[] = step.content?.blanks || [];
  const [answers, setAnswers] = useState<string[]>([]); const [showResult, setShowResult] = useState(false);
  function handleFinish() { setShowResult(true); } function handleContinue() { onSubmit(answers); }
  if (showResult) { let correct = 0; blanks.forEach((b, i) => { if ((answers[i] || '').toLowerCase().trim() === b.correctAnswer.toLowerCase().trim()) correct++; }); return (
    <div className="glass rounded-2xl p-8 text-center space-y-4" style={{ borderRadius: '24px', borderColor: correct === blanks.length ? 'rgba(0,255,100,0.4)' : 'rgba(255,0,110,0.4)' }}>
      <div className="text-4xl">{correct === blanks.length ? '✓' : '✗'}</div><h3 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: correct === blanks.length ? '#00FF64' : '#FF006E' }}>{correct === blanks.length ? 'COMPLETADO' : 'INCORRECTO'}</h3>
      <p className="text-[10px] text-purple-300/50">{correct} DE {blanks.length} CORRECTAS</p>
      <button onClick={handleContinue} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CONTINUAR →</button>
    </div>
  ); }
  return (
    <div className="glass rounded-2xl p-8" style={{ borderRadius: '24px', border: '1px solid rgba(0,245,255,0.3)' }}>
      <div className="text-[10px] text-purple-300/50 tracking-[3px] mb-4 text-center">COMPLETAR</div>
      <div className="space-y-3 mb-4">{blanks.map((b, i) => <div key={i} className="flex items-center gap-2"><span className="text-[9px] text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace" }}>#{i + 1}</span><input value={answers[i] || ''} onChange={e => { const c = [...answers]; c[i] = e.target.value; setAnswers(c); }} placeholder={b.placeholder || '...'} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }} /></div>)}</div>
      <button onClick={handleFinish} disabled={!answers.some(a => a?.trim())} className="w-full py-3 rounded-xl text-xs font-bold tracking-widest disabled:opacity-40" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>VERIFICAR →</button>
    </div>
  );
}
