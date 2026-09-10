'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, memo } from 'react';

// ─── Type Definitions ────────────────────────────────────────────

interface SiONoQuestion {
  prompt: string;
  answer: boolean;
}

interface OMQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

interface MSQuestion {
  prompt: string;
  options: { text: string; correct: boolean }[];
}

interface Pair {
  left: string;
  right: string;
}

interface SeqItem {
  id: string;
  text: string;
  correctOrder: number;
}

interface Classroom {
  id: string;
  name: string;
  code: string;
}

interface Rules {
  timeLimitMin: number;
  lives: number;
  basePoints: number;
}

interface Template {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// ─── Template List ───────────────────────────────────────────────

const TEMPLATES: Template[] = [
  { id: 'SiONo', name: 'Verdadero / Falso', icon: '◉', color: '#00F5FF', description: 'Preguntas con respuesta V/F' },
  { id: 'OpcionMultiple', name: 'Opcion multiple', icon: '◎', color: '#FF006E', description: 'Seleccionar la respuesta correcta' },
  { id: 'MultiSeleccion', name: 'Multi-seleccion', icon: '◇', color: '#7B2FBE', description: 'Varias respuestas correctas' },
  { id: 'RelacionarColumnas', name: 'Relacionar columnas', icon: '⟐', color: '#FFD60A', description: 'Emparejar conceptos' },
  { id: 'OrdenarSecuencia', name: 'Ordenar secuencia', icon: '▤', color: '#FF00FF', description: 'Ordenar elementos' },
  { id: 'SopaDeLetras', name: 'Sopa de letras', icon: '⬡', color: '#00F5FF', description: 'Encontrar palabras' },
  { id: 'Memoria', name: 'Memoria', icon: '♢', color: '#FFD60A', description: 'Encontrar parejas de conceptos' },
  { id: 'Crucigrama', name: 'Crucigrama', icon: '⊞', color: '#FF00FF', description: 'Resolver palabras cruzadas mediante pistas' },
  { id: 'CompletarEspacios', name: 'Completar espacios', icon: '⋯', color: '#00F5FF', description: 'Rellenar espacios vacios en textos' },
];

const stepLabels: readonly string[] = ['template', 'content', 'rules', 'assign'];
const steps: readonly string[] = ['TEMPLATE', 'CONTENIDO', 'REGLAS', 'ASIGNAR'];

// ─── Main Component ──────────────────────────────────────────────

export default function BuilderPage() {
  // Step / meta
  const [step, setStep] = useState<string>('template');
  const [selTemplate, setSelTemplate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gameCreated, setGameCreated] = useState(false);
  const [assigned, setAssigned] = useState(false);

  // ── SiONo state ──────────────────────────────────────────────
  const [sionoQuestions, setSiONoQuestions] = useState<SiONoQuestion[]>([
    { prompt: '', answer: true },
  ]);

  // ── OpcionMultiple state ─────────────────────────────────────
  const [omQuestions, setOMQuestions] = useState<OMQuestion[]>([
    { prompt: '', options: ['', ''], correctIndex: 0 },
  ]);

  // ── MultiSeleccion state ─────────────────────────────────────
  const [msQuestions, setMSQuestions] = useState<MSQuestion[]>([
    { prompt: '', options: [{ text: '', correct: false }, { text: '', correct: false }] },
  ]);

  // ── RelacionarColumnas state ─────────────────────────────────
  const [pairs, setPairs] = useState<Pair[]>([{ left: '', right: '' }, { left: '', right: '' }]);

  // ── OrdenarSecuencia state ───────────────────────────────────
  const [seqItems, setSeqItems] = useState<SeqItem[]>([{ id: '1', text: '', correctOrder: 1 }]);

  // ── SopaDeLetras state ───────────────────────────────────────
  const [sopaWords, setSopaWords] = useState<string[]>(['']);
  const [gridSize, setGridSize] = useState<number>(10);
  const [topic, setTopic] = useState<string>('');

  // ── Memoria state ──────────────────────────────────────────
  const [memoriaCards, setMemoriaCards] = useState<{ id: string; content: string; matchId: string }[]>([
    { id: '1', content: '', matchId: 'a' },
    { id: '2', content: '', matchId: 'a' },
  ]);

  // ── Crucigrama state ───────────────────────────────────────
  const [crosswordClues, setCrosswordClues] = useState<{ word: string; clue: string; x: number; y: number; direction: 'across' | 'down' }[]>([]);

  // ── CompletarEspacios state ────────────────────────────────
  const [fillText, setFillText] = useState('');
  const [fillBlanks, setFillBlanks] = useState<{ index: number; correctAnswer: string; placeholder?: string }[]>([]);

  // ── Rules state (NEW) ────────────────────────────────────────
  const [rules, setRules] = useState<Rules>({
    timeLimitMin: 0,
    lives: 3,
    basePoints: 100,
  });

  // ── Classroom state (NEW) ────────────────────────────────────
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [showNewClassroom, setShowNewClassroom] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // ── Load classrooms on mount (NEW) ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/classrooms', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setClassrooms)
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────────────────────────
  //  buildContent()
  // ─────────────────────────────────────────────────────────────
  function buildContent() {
    switch (selTemplate) {
      case 'SiONo':
        return { questions: sionoQuestions };
      case 'OpcionMultiple':
        return { questions: omQuestions.map(q => ({ ...q, options: q.options.filter(o => o.trim()) })) };
      case 'MultiSeleccion':
        return { questions: msQuestions.map(q => ({
          prompt: q.prompt,
          options: q.options.filter(o => o.text.trim()).map(o => ({ text: o.text, correct: o.correct }))
        })) };
      case 'RelacionarColumnas':
        return { pairs: pairs.filter(p => p.left.trim() && p.right.trim()) };
      case 'OrdenarSecuencia':
        return { items: seqItems.filter(i => i.text.trim()).map(i => ({ id: i.id, text: i.text, correctOrder: i.correctOrder })) };
      case 'SopaDeLetras':
        return { words: sopaWords.filter((w) => w.trim()), gridSize, topic };
      case 'Memoria':
        return { pairs: memoriaCards.filter(c => c.content.trim()) };
      case 'Crucigrama': {
        const validClues = crosswordClues.filter(c => c.word.trim());
        // Build grid from clues
        let maxX = 0, maxY = 0;
        validClues.forEach(clue => {
          const endX = clue.direction === 'across' ? clue.x + clue.word.length : clue.x + 1;
          const endY = clue.direction === 'down' ? clue.y + clue.word.length : clue.y + 1;
          maxX = Math.max(maxX, endX);
          maxY = Math.max(maxY, endY);
        });
        const rows = Math.max(maxY, 1);
        const cols = Math.max(maxX, 1);
        const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
        validClues.forEach(clue => {
          for (let i = 0; i < clue.word.length; i++) {
            const cx = clue.direction === 'across' ? clue.x + i : clue.x;
            const cy = clue.direction === 'down' ? clue.y + i : clue.y;
            if (cy < rows && cx < cols) grid[cy][cx] = clue.word[i].toUpperCase();
          }
        });
        return {
          grid,
          clues: validClues.map(c => ({
            answer: c.word.toUpperCase(),
            clue: c.clue,
            x: c.x,
            y: c.y,
            direction: c.direction,
          })),
        };
      }
      case 'CompletarEspacios':
        return { text: fillText, blanks: fillBlanks.filter(b => b.correctAnswer.trim()) };
      default:
        return {};
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  createGame()  — sends rules in body (NEW)
  // ─────────────────────────────────────────────────────────────
  async function createGame() {
    console.log('createGame called', { selTemplate, title: title?.trim(), template: !!selTemplate, titleTrimmed: !!title?.trim() });
    if (!selTemplate || !title.trim()) {
      console.warn('createGame: early return - missing template or title', { selTemplate, title });
      alert('Debes seleccionar una plantilla y escribir un título para el juego.');
      return;
    }
    setSubmitting(true);
    console.log('createGame: submitting...');
    try {
      const token = localStorage.getItem('token');
      console.log('createGame: token exists', !!token);
      const body = JSON.stringify({
        templateType: selTemplate,
        title: title.trim(),
        content: buildContent(),
        rules: {
          timeLimitSec: rules.timeLimitMin * 60,
          lives: rules.lives,
          basePoints: rules.basePoints,
        },
      });
      console.log('createGame: body', body.substring(0, 200));
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      console.log('createGame: response status', res.status);
      if (!res.ok) throw new Error(`Error al crear juego (${res.status})`);
      const data = await res.json();
      console.log('createGame: success', data);
      setCreatedGameId(data.id);
      setGameCreated(true);
      setStep('assign');
    } catch (e) {
      console.error('CreateGame error:', e);
      alert(e instanceof Error ? e.message : 'Error al crear juego');
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  handleAssign()  — POST /api/games/:gameId/assign
  // ─────────────────────────────────────────────────────────────
  async function handleAssign() {
    if (!createdGameId || !selectedClassroom) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/games/${createdGameId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classroomId: selectedClassroom }),
      });
      if (!res.ok) throw new Error('Error al asignar juego');
      setAssigned(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  handleCreateClassroom()  — POST /api/classrooms + refresh
  // ─────────────────────────────────────────────────────────────
  async function handleCreateClassroom() {
    if (!newClassName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newClassName.trim() }),
      });
      if (!res.ok) throw new Error('Error al crear salón');
      const data = await res.json();
      setSelectedClassroom(data.id);
      setShowNewClassroom(false);
      setNewClassName('');
      // Auto-refresh classrooms
      const fres = await fetch('/api/classrooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassrooms(await fres.json());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-pixel-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <span className="text-3xl animate-float" style={{ animationDuration: '5s', color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
          ◈
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <span className="text-gradient">CONSTRUCTOR</span>
          </h1>
          <div className="mt-1 text-xs tracking-[3px] text-purple-300/40" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ● CREADOR DE JUEGOS EDUCATIVOS
          </div>
        </div>
      </div>

      {/* ── Step indicator ─────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const idx = stepLabels.indexOf(step);
          const active = i <= idx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all duration-300 ${
                  active ? 'neon-border-cyan' : 'border border-white/10'
                }`}
                style={{
                  background: active ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)',
                  fontFamily: "'Press Start 2P', monospace",
                  color: active ? '#00F5FF' : 'rgba(255,255,255,0.3)',
                }}
              >
                {i + 1}
              </div>
              <span
                className={`hidden sm:inline text-[10px] tracking-wider transition-all duration-300 ${
                  active ? 'text-neon-cyan' : 'text-purple-400/30'
                }`}
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <span className="text-purple-400/20 text-[8px] hidden sm:inline">▸</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Decorative line ────────────────────────────────── */}
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />

      {/* ════════════════════════════════════════════════════════
          Step: Template
          ════════════════════════════════════════════════════════ */}
      {step === 'template' && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-cyan space-y-5" style={{ borderRadius: '24px' }}>
          <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            SELECCIONA UNA PLANTILLA
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => {
              const active = selTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelTemplate(t.id)}
                  className={`relative p-5 rounded-xl text-left transition-all duration-300 ${
                    active ? 'neon-border-cyan' : 'border border-white/5 hover:border-white/20'
                  }`}
                  style={{
                    background: active ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-2xl transition-transform duration-300"
                      style={{
                        color: t.color,
                        textShadow: `0 0 10px ${t.color}40`,
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {t.icon}
                    </span>
                    <span className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {t.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-300/50 leading-relaxed tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {t.description}
                  </p>
                  {active && (
                    <span className="absolute top-3 right-3 text-neon-cyan text-[9px]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Title input */}
          <div>
            <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Titulo del juego
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="EJ: MATEMATICAS DIVERTIDAS"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            />
          </div>

          <NavButtons
            onBack={() => {}}
            onNext={() => setStep('content')}
            backLabel="← CANCELAR"
            nextLabel="CONTINUAR →"
            disableNext={!selTemplate || !title.trim()}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Step: Content (6 template editors)
          ════════════════════════════════════════════════════════ */}
      {step === 'content' && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-purple space-y-5" style={{ borderRadius: '24px' }}>
          <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            EDITAR CONTENIDO — <span className="text-neon-pink">{TEMPLATES.find((t) => t.id === selTemplate)?.name ?? selTemplate}</span>
          </h2>

          {selTemplate === 'SiONo' && <SiONoEditor questions={sionoQuestions} setQuestions={setSiONoQuestions} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'OpcionMultiple' && <OpcionMultipleEditor questions={omQuestions} setQuestions={setOMQuestions} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'MultiSeleccion' && <MultiSeleccionEditor questions={msQuestions} setQuestions={setMSQuestions} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'RelacionarColumnas' && <RelacionarColumnasEditor pairs={pairs} setPairs={setPairs} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'OrdenarSecuencia' && <OrdenarSecuenciaEditor items={seqItems} setItems={setSeqItems} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'SopaDeLetras' && <SopaDeLetrasEditor words={sopaWords} setWords={setSopaWords} gridSize={gridSize} setGridSize={setGridSize} topic={topic} setTopic={setTopic} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'Memoria' && <MemoriaEditor cards={memoriaCards} setCards={setMemoriaCards} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'Crucigrama' && <CrucigramaEditor clues={crosswordClues} setClues={setCrosswordClues} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}

          {selTemplate === 'CompletarEspacios' && <CompletarEspaciosEditor text={fillText} setText={setFillText} blanks={fillBlanks} setBlanks={setFillBlanks} onBack={() => setStep('template')} onNext={() => setStep('rules')} />}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Step: Rules  (3 inputs + summary + submit)
          ════════════════════════════════════════════════════════ */}
      {step === 'rules' && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-purple space-y-5" style={{ borderRadius: '24px' }}>
          <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            CONFIGURAR REGLAS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                TIEMPO (MIN)
              </label>
              <input
                type="number"
                min={0}
                value={rules.timeLimitMin}
                onChange={(e) => setRules({ ...rules, timeLimitMin: +e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-neon-cyan/50 focus:outline-none transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
                placeholder="0 = sin limite"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Vidas
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rules.lives}
                onChange={(e) => setRules({ ...rules, lives: +e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-neon-cyan/50 focus:outline-none transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Puntos base
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={rules.basePoints}
                onChange={(e) => setRules({ ...rules, basePoints: +e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-neon-cyan/50 focus:outline-none transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-purple-300/50 leading-relaxed" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            RESUMEN: {TEMPLATES.find((t) => t.id === selTemplate)?.name ?? selTemplate} — &ldquo;{title || '(sin titulo)'}&rdquo;
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('content')}
              className="px-5 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white hover:border-white/30 transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ← ATRAS
            </button>
            <button
              onClick={createGame}
              disabled={submitting}
              className="px-5 py-3 rounded-xl text-xs tracking-wider font-bold transition-all duration-300 disabled:opacity-40"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(135deg, #FF006E, #7B2FBE)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(255,0,110,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '10px',
              }}
            >
              {submitting ? 'CREANDO...' : 'CREAR JUEGO'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Step: Assign  (classroom cards + create form + assign)
          ════════════════════════════════════════════════════════ */}
      {step === 'assign' && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-cyan space-y-5" style={{ borderRadius: '24px' }}>
          <div className="flex items-center gap-4 mb-2">
            <span
              className="text-3xl animate-float"
              style={{ animationDuration: '4s', color: '#00F5FF', textShadow: '0 0 15px rgba(0,245,255,0.4)' }}
            >
              ◈
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                JUEGO CREADO
              </h2>
              <p className="text-xs text-purple-300/50 tracking-wider mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                ASIGNA A UN SALON PARA EMPEZAR
              </p>
            </div>
          </div>

          {classrooms.length === 0 && !showNewClassroom ? (
            <div className="text-center py-4">
              <p className="text-xs text-purple-300/50 mb-3 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                NO TIENES SALONES AUN
              </p>
              <button
                onClick={() => setShowNewClassroom(true)}
                className="px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)',
                  color: '#fff',
                  boxShadow: '0 0 15px rgba(0,245,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '9px',
                }}
              >
                + CREAR SALON
              </button>
            </div>
          ) : null}

          {classrooms.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-purple-300/50 tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                SELECCIONA UN SALON:
              </div>
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassroom(c.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs tracking-wider transition-all duration-300 ${
                    selectedClassroom === c.id ? 'neon-border-cyan' : 'border border-white/10 hover:border-white/30'
                  }`}
                  style={{ background: selectedClassroom === c.id ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {c.name}
                  </span>
                  <span className="text-neon-yellow text-[9px] tracking-[3px]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {c.code}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setShowNewClassroom(true)}
                className="w-full py-2 text-[10px] text-purple-400/40 hover:text-neon-cyan transition-colors tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                + CREAR OTRO SALON
              </button>
            </div>
          )}

          {showNewClassroom && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <input
                type="text"
                placeholder="NOMBRE DEL NUEVO SALON"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
                autoFocus
              />
              <button
                onClick={handleCreateClassroom}
                disabled={!newClassName.trim()}
                className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)',
                  color: '#fff',
                  boxShadow: '0 0 10px rgba(0,245,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '9px',
                }}
              >
                CREAR Y ASIGNAR
              </button>
            </div>
          )}

          {selectedClassroom && !showNewClassroom && (
            <button
              onClick={handleAssign}
              className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 btn-neon-pulse"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(0,245,255,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '10px',
              }}
            >
              ASIGNAR A SALON
            </button>
          )}

          {!selectedClassroom && !showNewClassroom && classrooms.length === 0 && (
            <p className="text-xs text-purple-400/30 text-center tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              CREA UN SALON PARA ASIGNAR EL JUEGO
            </p>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Assigned: success feedback
          ════════════════════════════════════════════════════════ */}
      {assigned && (
        <div className="glass rounded-2xl p-8 sm:p-12 neon-border-green text-center space-y-5" style={{ borderRadius: '24px' }}>
          <div className="text-5xl animate-float" style={{ color: '#00FF64', textShadow: '0 0 20px rgba(0,255,100,0.4)' }}>✓</div>
          <h2 className="text-base sm:text-lg font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: '#00FF64' }}>
            JUEGO CREADO CON EXITO
          </h2>
          <p className="text-xs text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            El juego ha sido asignado al salon correctamente. Tus estudiantes ya pueden verlo y jugarlo.
          </p>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,100,0.3), transparent)' }} />
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => window.location.href = '/games'}
              className="px-6 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(135deg, #00FF64, #00B8FF)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(0,255,100,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '9px',
              }}>
              VER MIS JUEGOS →
            </button>
            <button onClick={() => { window.location.href = '/builder'; }}
              className="px-6 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white hover:border-white/30 transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px' }}>
              CREAR OTRO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Extracted Editor Components (memo-wrapped) ────────────────────

const SiONoEditor = memo(function SiONoEditor({ questions, setQuestions, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      {questions.map((q: any, qi: number) => (
        <div key={qi} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              PREGUNTA {qi + 1}
            </span>
            {questions.length > 1 && (
              <button
                onClick={() => setQuestions(questions.filter((_: any, i: number) => i !== qi))}
                className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                ELIMINAR
              </button>
            )}
          </div>
          <input
            type="text"
            value={q.prompt}
            onChange={(e) => {
              const copy = [...questions];
              copy[qi] = { ...copy[qi], prompt: e.target.value };
              setQuestions(copy);
            }}
            placeholder="¿PREGUNTA?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={q.answer}
              onChange={(e) => {
                const copy = [...questions];
                copy[qi] = { ...copy[qi], answer: e.target.checked };
                setQuestions(copy);
              }}
              className="w-4 h-4 rounded accent-neon-cyan"
            />
            <span className="text-xs text-purple-300/70 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Respuesta correcta (marcado = Verdadero)
            </span>
          </label>
        </div>
      ))}
      <button
        onClick={() => setQuestions([...questions, { prompt: '', answer: true }])}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        + AGREGAR PREGUNTA
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

const OpcionMultipleEditor = memo(function OpcionMultipleEditor({ questions, setQuestions, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      {questions.map((q: any, qi: number) => (
        <div key={qi} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              PREGUNTA {qi + 1}
            </span>
            {questions.length > 1 && (
              <button
                onClick={() => setQuestions(questions.filter((_: any, i: number) => i !== qi))}
                className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                ELIMINAR
              </button>
            )}
          </div>
          <input
            type="text"
            value={q.prompt}
            onChange={(e) => {
              const copy = [...questions];
              copy[qi] = { ...copy[qi], prompt: e.target.value };
              setQuestions(copy);
            }}
            placeholder="¿PREGUNTA?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          <div className="space-y-2">
            {q.options.map((opt: string, oi: number) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`om-correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => {
                    const copy = [...questions];
                    copy[qi] = { ...copy[qi], correctIndex: oi };
                    setQuestions(copy);
                  }}
                  className="w-4 h-4 accent-neon-pink"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const copy = [...questions];
                    const opts = [...copy[qi].options];
                    opts[oi] = e.target.value;
                    copy[qi] = { ...copy[qi], options: opts };
                    setQuestions(copy);
                  }}
                  placeholder={`OPCION ${oi + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => {
                      const copy = [...questions];
                      const opts = copy[qi].options.filter((_: string, i: number) => i !== oi);
                      let ci = copy[qi].correctIndex;
                      if (ci >= opts.length) ci = opts.length - 1;
                      if (oi < copy[qi].correctIndex) ci = copy[qi].correctIndex - 1;
                      copy[qi] = { ...copy[qi], options: opts, correctIndex: ci };
                      setQuestions(copy);
                    }}
                    className="text-neon-pink/40 hover:text-neon-pink text-[9px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const copy = [...questions];
              copy[qi] = { ...copy[qi], options: [...copy[qi].options, ''] };
              setQuestions(copy);
            }}
            className="text-[10px] text-purple-300/50 hover:text-neon-cyan transition-colors tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            + AGREGAR OPCION
          </button>
        </div>
      ))}
      <button
        onClick={() => setQuestions([...questions, { prompt: '', options: ['', ''], correctIndex: 0 }])}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        + AGREGAR PREGUNTA
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

const MultiSeleccionEditor = memo(function MultiSeleccionEditor({ questions, setQuestions, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      {questions.map((q: any, qi: number) => (
        <div key={qi} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              PREGUNTA {qi + 1}
            </span>
            {questions.length > 1 && (
              <button
                onClick={() => setQuestions(questions.filter((_: any, i: number) => i !== qi))}
                className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                ELIMINAR
              </button>
            )}
          </div>
          <input
            type="text"
            value={q.prompt}
            onChange={(e) => {
              const copy = [...questions];
              copy[qi] = { ...copy[qi], prompt: e.target.value };
              setQuestions(copy);
            }}
            placeholder="¿PREGUNTA?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          <div className="space-y-2">
            {q.options.map((opt: any, oi: number) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opt.correct}
                  onChange={() => {
                    const copy = [...questions];
                    const opts = [...copy[qi].options];
                    opts[oi] = { ...opts[oi], correct: !opts[oi].correct };
                    copy[qi] = { ...copy[qi], options: opts };
                    setQuestions(copy);
                  }}
                  className="w-4 h-4 accent-neon-purple"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const copy = [...questions];
                    const opts = [...copy[qi].options];
                    opts[oi] = { ...opts[oi], text: e.target.value };
                    copy[qi] = { ...copy[qi], options: opts };
                    setQuestions(copy);
                  }}
                  placeholder={`OPCION ${oi + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => {
                      const copy = [...questions];
                      copy[qi] = { ...copy[qi], options: copy[qi].options.filter((_: any, i: number) => i !== oi) };
                      setQuestions(copy);
                    }}
                    className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                const copy = [...questions];
                copy[qi] = { ...copy[qi], options: [...copy[qi].options, { text: '', correct: false }] };
                setQuestions(copy);
              }}
              className="text-[10px] text-neon-cyan/60 hover:text-neon-cyan transition-colors"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              + ANIADIR OPCION
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => setQuestions([...questions, { prompt: '', options: [{ text: '', correct: false }, { text: '', correct: false }] }])}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        + AGREGAR PREGUNTA
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

const RelacionarColumnasEditor = memo(function RelacionarColumnasEditor({ pairs, setPairs, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-2">
        <span className="text-[10px] text-purple-300/50 tracking-wider text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          COLUMNA IZQUIERDA
        </span>
        <span className="text-[10px] text-purple-300/50 tracking-wider text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          COLUMNA DERECHA
        </span>
      </div>
      {pairs.map((p: any, pi: number) => (
        <div key={pi} className="flex items-center gap-3">
          <input
            type="text"
            value={p.left}
            onChange={(e) => {
              const copy = [...pairs];
              copy[pi] = { ...copy[pi], left: e.target.value };
              setPairs(copy);
            }}
            placeholder="IZQUIERDA"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          <span className="text-neon-cyan/50 text-[9px]">⬌</span>
          <input
            type="text"
            value={p.right}
            onChange={(e) => {
              const copy = [...pairs];
              copy[pi] = { ...copy[pi], right: e.target.value };
              setPairs(copy);
            }}
            placeholder="DERECHA"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          {pairs.length > 1 && (
            <button
              onClick={() => setPairs(pairs.filter((_: any, i: number) => i !== pi))}
              className="text-neon-pink/40 hover:text-neon-pink text-[9px]"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setPairs([...pairs, { left: '', right: '' }])}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        + AGREGAR PAR
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

const OrdenarSecuenciaEditor = memo(function OrdenarSecuenciaEditor({ items, setItems, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        ORDENA LOS ELEMENTOS EN LA SECUENCIA CORRECTA (1 = primero)
      </p>
      {items.map((item: any, ii: number) => (
        <div key={ii} className="flex items-center gap-3">
          <span className="text-neon-cyan text-[10px] w-6 text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            {item.correctOrder}
          </span>
          <input
            type="text"
            value={item.text}
            onChange={(e) => {
              const copy = [...items];
              copy[ii] = { ...copy[ii], text: e.target.value };
              setItems(copy);
            }}
            placeholder="ELEMENTO"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          <input
            type="number"
            min={1}
            value={item.correctOrder}
            onChange={(e) => {
              const copy = [...items];
              copy[ii] = { ...copy[ii], correctOrder: parseInt(e.target.value) || 1 };
              setItems(copy);
            }}
            className="w-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          />
          {items.length > 1 && (
            <button
              onClick={() => setItems(items.filter((_: any, i: number) => i !== ii))}
              className="text-neon-pink/40 hover:text-neon-pink text-[9px]"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setItems([...items, { id: String(Date.now()), text: '', correctOrder: items.length + 1 }])}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        + AGREGAR ELEMENTO
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

const SopaDeLetrasEditor = memo(function SopaDeLetrasEditor({ words, setWords, gridSize, setGridSize, topic, setTopic, onBack, onNext }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Tema
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="EJ: ANIMALES, PAISES, ..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        />
      </div>
      <div>
        <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Tamaño de cuadrícula
        </label>
        <input
          type="number"
          min={5}
          max={20}
          value={gridSize}
          onChange={(e) => setGridSize(+e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-neon-cyan/50 focus:outline-none transition-all"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            PALABRAS A ENCONTRAR
          </span>
          <span className="text-[9px] text-purple-400/30" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {words.filter((w: string) => w.trim()).length} palabras
          </span>
        </div>
        {words.map((w: string, wi: number) => (
          <div key={wi} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={w}
              onChange={(e) => {
                const copy = [...words];
                copy[wi] = e.target.value;
                setWords(copy);
              }}
              placeholder={`PALABRA ${wi + 1}`}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all uppercase tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            />
            {words.length > 1 && (
              <button
                onClick={() => setWords(words.filter((_: string, i: number) => i !== wi))}
                className="text-neon-pink/40 hover:text-neon-pink text-[9px]"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setWords([...words, ''])}
          className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          + AGREGAR PALABRA
        </button>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

// ─── MemoriaEditor ───────────────────────────────────────────

const MemoriaEditor = memo(function MemoriaEditor({ cards, setCards, onBack, onNext }: any) {
  const pairIds = Array.from(new Set(cards.map((c: any) => c.matchId))) as string[];
  function addPair() {
    const newId = String(Date.now());
    setCards([...cards, { id: `${newId}-a`, content: '', matchId: newId }, { id: `${newId}-b`, content: '', matchId: newId }]);
  }
  function removePair(matchId: string) {
    if (pairIds.length <= 1) return;
    setCards(cards.filter((c: any) => c.matchId !== matchId));
  }
  function updateCard(cardId: string, content: string) {
    setCards(cards.map((c: any) => c.id === cardId ? { ...c, content } : c));
  }
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        CADA PAR DE TARJETAS DEBE TENER EL MISMO CONTENIDO OCULTO (MATCH). EL ESTUDIANTE DEBE ENCONTRAR LAS PAREJAS.
      </p>
      {pairIds.map((matchId: string, pi: number) => {
        const pairCards = cards.filter((c: any) => c.matchId === matchId);
        return (
          <div key={matchId} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                PAR {pi + 1}
              </span>
              {pairIds.length > 1 && (
                <button onClick={() => removePair(matchId)} className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  ELIMINAR
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {pairCards.map((card: any) => (
                <input key={card.id} type="text" value={card.content}
                  onChange={(e) => updateCard(card.id, e.target.value)}
                  placeholder={`TARJETA ${pairCards.indexOf(card) + 1} (CONTENIDO IGUAL)`}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
                  style={{ fontFamily: "'Orbitron', sans-serif" }} />
              ))}
            </div>
          </div>
        );
      })}
      <button onClick={addPair}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}>
        + AGREGAR PAR
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

// ─── CrucigramaEditor ────────────────────────────────────────

const CrucigramaEditor = memo(function CrucigramaEditor({ clues, setClues, onBack, onNext }: any) {
  function addClue() {
    setClues([...clues, { word: '', clue: '', x: 0, y: 0, direction: 'across' as const }]);
  }
  function updateClue(idx: number, field: string, value: any) {
    const copy = [...clues];
    copy[idx] = { ...copy[idx], [field]: value };
    setClues(copy);
  }
  function removeClue(idx: number) {
    setClues(clues.filter((_: any, i: number) => i !== idx));
  }
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        INGRESA LAS PALABRAS Y PISTAS DEL CRUCIGRAMA. ESPECIFICA POSICION INICIAL (X, Y) Y DIRECCION.
      </p>
      {clues.map((clue: any, ci: number) => (
        <div key={ci} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              PISTA {ci + 1}
            </span>
            <button onClick={() => removeClue(ci)} className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ELIMINAR
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={clue.word}
              onChange={(e) => updateClue(ci, 'word', e.target.value.toUpperCase())}
              placeholder="PALABRA (EJ: CASA)"
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all uppercase tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }} />
            <select value={clue.direction}
              onChange={(e) => updateClue(ci, 'direction', e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-neon-cyan/50 focus:outline-none transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <option value="across">HORIZONTAL</option>
              <option value="down">VERTICAL</option>
            </select>
          </div>
          <input type="text" value={clue.clue}
            onChange={(e) => updateClue(ci, 'clue', e.target.value)}
            placeholder="PISTA (EJ: LUGAR DONDE VIVES)"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[8px] text-purple-400/40 tracking-wider block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>X (COLUMNA)</label>
              <input type="number" min={0} value={clue.x}
                onChange={(e) => updateClue(ci, 'x', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:border-neon-cyan/50 focus:outline-none transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }} />
            </div>
            <div>
              <label className="text-[8px] text-purple-400/40 tracking-wider block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>Y (FILA)</label>
              <input type="number" min={0} value={clue.y}
                onChange={(e) => updateClue(ci, 'y', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:border-neon-cyan/50 focus:outline-none transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addClue}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}>
        + AGREGAR PISTA
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

// ─── CompletarEspaciosEditor ─────────────────────────────────

const CompletarEspaciosEditor = memo(function CompletarEspaciosEditor({ text, setText, blanks, setBlanks, onBack, onNext }: any) {
  function addBlank() {
    setBlanks([...blanks, { index: blanks.length, correctAnswer: '', placeholder: '...' }]);
  }
  function updateBlank(idx: number, field: string, value: any) {
    const copy = [...blanks];
    copy[idx] = { ...copy[idx], [field]: value };
    setBlanks(copy);
  }
  function removeBlank(idx: number) {
    const copy = blanks.filter((_: any, i: number) => i !== idx);
    setBlanks(copy.map((b: any, i: number) => ({ ...b, index: i })));
  }
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        ESCRIBE UN TEXTO Y MARCA LAS PALABRAS QUE LOS ESTUDIANTES DEBEN COMPLETAR. CADA HUECO TIENE UNA RESPUESTA CORRECTA.
      </p>
      <div>
        <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          TEXTO BASE
        </label>
        <textarea value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="EJ: El _____ es el planeta mas cercano al sol."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider resize-none"
          style={{ fontFamily: "'Orbitron', sans-serif" }} />
      </div>
      {blanks.map((blank: any, bi: number) => (
        <div key={bi} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              HUECO #{blank.index + 1}
            </span>
            <button onClick={() => removeBlank(bi)} className="text-[9px] text-neon-pink/50 hover:text-neon-pink transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ELIMINAR
            </button>
          </div>
          <input type="text" value={blank.correctAnswer}
            onChange={(e) => updateBlank(bi, 'correctAnswer', e.target.value)}
            placeholder="RESPUESTA CORRECTA"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all uppercase tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }} />
          <input type="text" value={blank.placeholder || ''}
            onChange={(e) => updateBlank(bi, 'placeholder', e.target.value)}
            placeholder="TEXTO SUGERIDO (OPCIONAL, EJ: planeta)"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }} />
        </div>
      ))}
      <button onClick={addBlank}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[10px] text-purple-300/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}>
        + AGREGAR HUECO
      </button>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
});

// ─── NavButtons Component ─────────────────────────────────────────

interface NavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  disableNext?: boolean;
}

function NavButtons({
  onBack,
  onNext,
  backLabel = '← ATRÁS',
  nextLabel = 'SIGUIENTE →',
  disableNext = false,
}: NavButtonsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onBack}
        className="px-5 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white hover:border-white/30 transition-all"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="px-5 py-3 rounded-xl text-xs tracking-wider font-bold transition-all duration-300 disabled:opacity-40"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          background: 'linear-gradient(135deg, #FF006E, #7B2FBE)',
          color: '#fff',
          boxShadow: '0 0 15px rgba(255,0,110,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '10px',
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
