'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */

import { useState, useEffect } from 'react';

// ─── Template definitions ─────────────────────────────────────

const ALL_TEMPLATES = [
  { id: 'SiONo', name: 'Verdadero / Falso', icon: '◉', color: '#00F5FF' },
  { id: 'OpcionMultiple', name: 'Opción múltiple', icon: '◎', color: '#FF006E' },
  { id: 'MultiSeleccion', name: 'Multi-selección', icon: '◇', color: '#7B2FBE' },
  { id: 'RelacionarColumnas', name: 'Relacionar columnas', icon: '⟐', color: '#FFD60A' },
  { id: 'OrdenarSecuencia', name: 'Ordenar secuencia', icon: '▤', color: '#FF00FF' },
  { id: 'SopaDeLetras', name: 'Sopa de letras', icon: '⬡', color: '#00F5FF' },
  { id: 'Memoria', name: 'Memoria', icon: '♢', color: '#FFD60A' },
  { id: 'Crucigrama', name: 'Crucigrama', icon: '⊞', color: '#FF00FF' },
  { id: 'CompletarEspacios', name: 'Completar espacios', icon: '⋯', color: '#00F5FF' },
];

interface StepData {
  templateType: string;
  title: string;
  content: any;
  rules: { timeLimitSec: number; lives: number; basePoints: number };
}

interface SequenceData {
  topic: string;
  steps: StepData[];
}

// ─── Step content editors per template ────────────────────────

function StepContentEditor({ templateType, content, onChange }: { templateType: string; content: any; onChange: (c: any) => void }) {
  switch (templateType) {
    case 'SiONo':
      return <SiONoStepEditor content={content} onChange={onChange} />;
    case 'OpcionMultiple':
      return <OpcionMultipleStepEditor content={content} onChange={onChange} />;
    case 'MultiSeleccion':
      return <MultiSeleccionStepEditor content={content} onChange={onChange} />;
    case 'RelacionarColumnas':
      return <RelacionarColumnasStepEditor content={content} onChange={onChange} />;
    case 'OrdenarSecuencia':
      return <OrdenarSecuenciaStepEditor content={content} onChange={onChange} />;
    case 'SopaDeLetras':
      return <SopaDeLetrasStepEditor content={content} onChange={onChange} />;
    case 'Memoria':
      return <MemoriaStepEditor content={content} onChange={onChange} />;
    case 'Crucigrama':
      return <CrucigramaStepEditor content={content} onChange={onChange} />;
    case 'CompletarEspacios':
      return <CompletarEspaciosStepEditor content={content} onChange={onChange} />;
    default:
      return <div className="text-xs text-purple-300/50">Selecciona un tipo de juego</div>;
  }
}

function SiONoStepEditor({ content, onChange }: any) {
  const questions = content?.questions || [{ prompt: '', answer: true }];
  function setQuestions(qs: any[]) { onChange({ ...content, questions: qs }); }
  return (
    <div className="space-y-2">
      {questions.map((q: any, i: number) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
          <input value={q.prompt} onChange={e => { const c = [...questions]; c[i] = { ...c[i], prompt: e.target.value }; setQuestions(c); }}
            placeholder="Pregunta" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs" />
          <label className="flex items-center gap-1 text-[9px] text-purple-300/50 whitespace-nowrap">
            <input type="checkbox" checked={q.answer} onChange={e => { const c = [...questions]; c[i] = { ...c[i], answer: e.target.checked }; setQuestions(c); }} className="accent-neon-cyan" />
            V
          </label>
          {questions.length > 1 && <button onClick={() => setQuestions(questions.filter((_: any, j: number) => j !== i))} className="text-neon-pink/50 text-[9px]">✕</button>}
        </div>
      ))}
      <button onClick={() => setQuestions([...questions, { prompt: '', answer: true }])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Agregar pregunta</button>
    </div>
  );
}

function OpcionMultipleStepEditor({ content, onChange }: any) {
  const questions = content?.questions || [{ prompt: '', options: ['', ''], correctIndex: 0 }];
  function setQuestions(qs: any[]) { onChange({ ...content, questions: qs }); }
  return (
    <div className="space-y-2">
      {questions.map((q: any, i: number) => (
        <div key={i} className="p-2 rounded-lg bg-white/5 space-y-1">
          <input value={q.prompt} onChange={e => { const c = [...questions]; c[i] = { ...c[i], prompt: e.target.value }; setQuestions(c); }}
            placeholder="Pregunta" className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs" />
          {q.options.map((opt: string, oi: number) => (
            <div key={oi} className="flex items-center gap-1">
              <input type="radio" name={`om-${i}`} checked={q.correctIndex === oi}
                onChange={() => { const c = [...questions]; c[i] = { ...c[i], correctIndex: oi }; setQuestions(c); }} className="accent-neon-pink w-3 h-3" />
              <input value={opt} onChange={e => { const c = [...questions]; const opts = [...c[i].options]; opts[oi] = e.target.value; c[i] = { ...c[i], options: opts }; setQuestions(c); }}
                placeholder={`Opción ${oi + 1}`} className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
            </div>
          ))}
          <button onClick={() => { const c = [...questions]; c[i] = { ...c[i], options: [...c[i].options, ''] }; setQuestions(c); }} className="text-[9px] text-purple-300/50">+ Opción</button>
        </div>
      ))}
      <button onClick={() => setQuestions([...questions, { prompt: '', options: ['', ''], correctIndex: 0 }])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Pregunta</button>
    </div>
  );
}

function MultiSeleccionStepEditor({ content, onChange }: any) {
  const questions = content?.questions || [{ prompt: '', options: [{ text: '', correct: false }, { text: '', correct: false }] }];
  function setQuestions(qs: any[]) { onChange({ ...content, questions: qs }); }
  return (
    <div className="space-y-2">
      {questions.map((q: any, i: number) => (
        <div key={i} className="p-2 rounded-lg bg-white/5 space-y-1">
          <input value={q.prompt} onChange={e => { const c = [...questions]; c[i] = { ...c[i], prompt: e.target.value }; setQuestions(c); }}
            placeholder="Pregunta" className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs" />
          {q.options.map((opt: any, oi: number) => (
            <div key={oi} className="flex items-center gap-1">
              <input type="checkbox" checked={opt.correct} onChange={() => { const c = [...questions]; const opts = [...c[i].options]; opts[oi] = { ...opts[oi], correct: !opts[oi].correct }; c[i] = { ...c[i], options: opts }; setQuestions(c); }} className="accent-neon-purple w-3 h-3" />
              <input value={opt.text} onChange={e => { const c = [...questions]; const opts = [...c[i].options]; opts[oi] = { ...opts[oi], text: e.target.value }; c[i] = { ...c[i], options: opts }; setQuestions(c); }}
                placeholder={`Opción ${oi + 1}`} className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
            </div>
          ))}
          <button onClick={() => { const c = [...questions]; c[i] = { ...c[i], options: [...c[i].options, { text: '', correct: false }] }; setQuestions(c); }} className="text-[9px] text-purple-300/50">+ Opción</button>
        </div>
      ))}
      <button onClick={() => setQuestions([...questions, { prompt: '', options: [{ text: '', correct: false }, { text: '', correct: false }] }])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Pregunta</button>
    </div>
  );
}

function RelacionarColumnasStepEditor({ content, onChange }: any) {
  const pairs = content?.pairs || [{ left: '', right: '' }, { left: '', right: '' }];
  function setPairs(p: any[]) { onChange({ ...content, pairs: p }); }
  return (
    <div className="space-y-1">
      {pairs.map((pair: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <input value={pair.left} onChange={e => { const c = [...pairs]; c[i] = { ...c[i], left: e.target.value }; setPairs(c); }} placeholder="Izquierda" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
          <span className="text-neon-cyan/50 text-[9px]">↔</span>
          <input value={pair.right} onChange={e => { const c = [...pairs]; c[i] = { ...c[i], right: e.target.value }; setPairs(c); }} placeholder="Derecha" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
          {pairs.length > 1 && <button onClick={() => setPairs(pairs.filter((_: any, j: number) => j !== i))} className="text-neon-pink/50 text-[9px]">✕</button>}
        </div>
      ))}
      <button onClick={() => setPairs([...pairs, { left: '', right: '' }])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Par</button>
    </div>
  );
}

function OrdenarSecuenciaStepEditor({ content, onChange }: any) {
  const items = content?.items || [{ id: '1', text: '', correctOrder: 1 }];
  function setItems(items: any[]) { onChange({ ...content, items }); }
  return (
    <div className="space-y-1">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-neon-cyan text-[10px] w-4">{item.correctOrder}</span>
          <input value={item.text} onChange={e => { const c = [...items]; c[i] = { ...c[i], text: e.target.value }; setItems(c); }} placeholder="Elemento" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
          <input type="number" min={1} value={item.correctOrder} onChange={e => { const c = [...items]; c[i] = { ...c[i], correctOrder: parseInt(e.target.value) || 1 }; setItems(c); }} className="w-12 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] text-center" />
          {items.length > 1 && <button onClick={() => setItems(items.filter((_: any, j: number) => j !== i))} className="text-neon-pink/50 text-[9px]">✕</button>}
        </div>
      ))}
      <button onClick={() => setItems([...items, { id: String(Date.now()), text: '', correctOrder: items.length + 1 }])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Elemento</button>
    </div>
  );
}

function SopaDeLetrasStepEditor({ content, onChange }: any) {
  const words = content?.words || [''];
  function setWords(w: string[]) { onChange({ ...content, words: w, gridSize: content?.gridSize || 10, topic: content?.topic || '' }); }
  return (
    <div className="space-y-1">
      <input value={content?.topic || ''} onChange={e => onChange({ ...content, topic: e.target.value })} placeholder="Tema" className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] mb-1" />
      {words.map((w: string, i: number) => (
        <div key={i} className="flex items-center gap-1">
          <input value={w} onChange={e => { const c = [...words]; c[i] = e.target.value; setWords(c); }} placeholder={`Palabra ${i + 1}`} className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] uppercase" />
          {words.length > 1 && <button onClick={() => setWords(words.filter((_: string, j: number) => j !== i))} className="text-neon-pink/50 text-[9px]">✕</button>}
        </div>
      ))}
      <button onClick={() => setWords([...words, ''])} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Palabra</button>
    </div>
  );
}

function MemoriaStepEditor({ content, onChange }: any) {
  const pairs = content?.pairs || [];
  function addPair() {
    const newId = String(Date.now());
    onChange({ ...content, pairs: [...pairs, { id: `${newId}-a`, content: '', matchId: newId }, { id: `${newId}-b`, content: '', matchId: newId }] });
  }
  function updateCard(cardId: string, val: string) {
    onChange({ ...content, pairs: pairs.map((c: any) => c.id === cardId ? { ...c, content: val } : c) });
  }
  function removePair(matchId: string) {
    onChange({ ...content, pairs: pairs.filter((c: any) => c.matchId !== matchId) });
  }
  const pairIds = Array.from(new Set(pairs.map((c: any) => c.matchId))) as string[];
  if (pairIds.length === 0) {
    return <button onClick={addPair} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Agregar par de tarjetas</button>;
  }
  return (
    <div className="space-y-1">
      {pairIds.map((mid) => {
        const pairCards = pairs.filter((c: any) => c.matchId === mid);
        return (
          <div key={mid} className="flex items-center gap-2">
            {pairCards.map((card: any) => (
              <input key={card.id} value={card.content} onChange={e => updateCard(card.id, e.target.value)} placeholder="Contenido" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
            ))}
            <button onClick={() => removePair(mid)} className="text-neon-pink/50 text-[9px]">✕</button>
          </div>
        );
      })}
      <button onClick={addPair} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Par</button>
    </div>
  );
}

function CrucigramaStepEditor({ content, onChange }: any) {
  const clues = content?.clues || [];
  function addClue() { onChange({ ...content, clues: [...clues, { word: '', clue: '', x: 0, y: 0, direction: 'across' }] }); }
  function updateClue(i: number, field: string, val: any) {
    const c = [...clues]; c[i] = { ...c[i], [field]: val }; onChange({ ...content, clues: c });
  }
  return (
    <div className="space-y-1">
      {clues.map((clue: any, i: number) => (
        <div key={i} className="p-2 rounded-lg bg-white/5 space-y-1">
          <div className="flex gap-1">
            <input value={clue.word} onChange={e => updateClue(i, 'word', e.target.value.toUpperCase())} placeholder="Palabra" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] uppercase" />
            <select value={clue.direction} onChange={e => updateClue(i, 'direction', e.target.value)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" style={{ color: '#fff', background: '#1a0533' }}>
              <option value="across" style={{ color: '#fff', background: '#1a0533' }}>H</option>
              <option value="down" style={{ color: '#fff', background: '#1a0533' }}>V</option>
            </select>
          </div>
          <input value={clue.clue} onChange={e => updateClue(i, 'clue', e.target.value)} placeholder="Pista" className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px]" />
          <div className="flex gap-2">
            <input type="number" min={0} value={clue.x} onChange={e => updateClue(i, 'x', parseInt(e.target.value) || 0)} placeholder="X" className="w-12 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] text-center" />
            <input type="number" min={0} value={clue.y} onChange={e => updateClue(i, 'y', parseInt(e.target.value) || 0)} placeholder="Y" className="w-12 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] text-center" />
            <button onClick={() => onChange({ ...content, clues: clues.filter((_: any, j: number) => j !== i) })} className="text-neon-pink/50 text-[9px]">✕</button>
          </div>
        </div>
      ))}
      <button onClick={addClue} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Palabra</button>
    </div>
  );
}

function CompletarEspaciosStepEditor({ content, onChange }: any) {
  const blanks = content?.blanks || [];
  function addBlank() { onChange({ ...content, blanks: [...blanks, { index: blanks.length, correctAnswer: '' }] }); }
  return (
    <div className="space-y-1">
      <textarea value={content?.text || ''} onChange={e => onChange({ ...content, text: e.target.value })} placeholder="Texto base con _____" rows={2} className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] resize-none" />
      {blanks.map((b: any, i: number) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-[9px] text-neon-cyan w-4">#{i + 1}</span>
          <input value={b.correctAnswer} onChange={e => { const c = [...blanks]; c[i] = { ...c[i], correctAnswer: e.target.value }; onChange({ ...content, blanks: c }); }} placeholder="Respuesta" className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[10px] uppercase" />
          <button onClick={() => onChange({ ...content, blanks: blanks.filter((_: any, j: number) => j !== i).map((x: any, k: number) => ({ ...x, index: k })) })} className="text-neon-pink/50 text-[9px]">✕</button>
        </div>
      ))}
      <button onClick={addBlank} className="text-[9px] text-purple-300/50 hover:text-neon-cyan">+ Hueco</button>
    </div>
  );
}

// ─── Main SequenceBuilder Page ─────────────────────────────────

export default function SequenceBuilderPage() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [steps, setSteps] = useState<StepData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addStep(templateType: string) {
    setSteps([...steps, {
      templateType,
      title: '',
      content: {},
      rules: { timeLimitSec: 60, lives: 3, basePoints: 100 },
    }]);
  }

  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, field: string, value: any) {
    const copy = [...steps];
    (copy[idx] as any)[field] = value;
    setSteps(copy);
  }

  function updateStepRules(idx: number, field: string, value: number) {
    const copy = [...steps];
    copy[idx].rules[field as keyof typeof copy[0]['rules']] = value;
    setSteps(copy);
  }

  // Build the grid from crossword clues for submission
  function buildFinalSteps() {
    return steps.map(s => {
      let content = { ...s.content };
      let finalRules = { ...s.rules };

      // For crucigrama, generate grid
      if (s.templateType === 'Crucigrama' && s.content?.clues) {
        const validClues = s.content.clues.filter((c: any) => c.word?.trim());
        let maxX = 0, maxY = 0;
        validClues.forEach((clue: any) => {
          const endX = clue.direction === 'across' ? clue.x + clue.word.length : clue.x + 1;
          const endY = clue.direction === 'down' ? clue.y + clue.word.length : clue.y + 1;
          maxX = Math.max(maxX, endX);
          maxY = Math.max(maxY, endY);
        });
        const rows = Math.max(maxY, 1);
        const cols = Math.max(maxX, 1);
        const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
        validClues.forEach((clue: any) => {
          for (let i = 0; i < clue.word.length; i++) {
            const cx = clue.direction === 'across' ? clue.x + i : clue.x;
            const cy = clue.direction === 'down' ? clue.y + i : clue.y;
            if (cy < rows && cx < cols) grid[cy][cx] = clue.word[i].toUpperCase();
          }
        });
        content = {
          grid,
          clues: validClues.map((c: any) => ({
            answer: c.word.toUpperCase(),
            clue: c.clue,
            x: c.x,
            y: c.y,
            direction: c.direction,
          })),
        };
      }

      // For memoria, validate pairs
      if (s.templateType === 'Memoria') {
        content = { pairs: (s.content?.pairs || []).filter((c: any) => c.content?.trim()) };
      }

      return {
        templateType: s.templateType,
        title: s.title,
        content,
        rules: finalRules,
      };
    });
  }

  async function handleCreate() {
    if (!title.trim()) { setError('Ingresa un título para la secuencia'); return; }
    if (!topic.trim()) { setError('Ingresa un tema para la secuencia'); return; }
    if (steps.length === 0) { setError('Agrega al menos un juego a la secuencia'); return; }
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].title.trim()) { setError(`Paso ${i + 1}: ingresa un título`); return; }
    }

    setSubmitting(true);
    setError(null);

    const finalSteps = buildFinalSteps();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          templateType: 'Secuencia',
          title: title.trim(),
          content: { topic: topic.trim(), steps: finalSteps },
          rules: { basePoints: 100, timeLimitSec: 0, lives: 3 },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al crear secuencia' }));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const data = await res.json();
      setCreatedId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <div className="glass rounded-2xl p-8 sm:p-12 neon-border-green text-center space-y-5" style={{ borderRadius: '24px' }}>
          <div className="text-5xl animate-float" style={{ color: '#00FF64', textShadow: '0 0 20px rgba(0,255,100,0.4)' }}>✓</div>
          <h2 className="text-base sm:text-lg font-bold" style={{ fontFamily: "'Press Start 2P', monospace", color: '#00FF64' }}>
            SECUENCIA CREADA
          </h2>
          <p className="text-xs text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            &ldquo;{title}&rdquo; — {steps.length} juego{steps.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => window.location.href = '/games'}
              className="px-6 py-3 rounded-xl text-xs font-bold tracking-widest"
              style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #00FF64, #00B8FF)', color: '#fff', boxShadow: '0 0 15px rgba(0,255,100,0.3)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }}>
              VER MIS JUEGOS →
            </button>
            <button onClick={() => { window.location.href = '/builder/sequence'; }}
              className="px-6 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px' }}>
              CREAR OTRA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Template selection grid ──
  const selectedTypes = steps.map(s => s.templateType);
  const availableTemplates = ALL_TEMPLATES.filter(t => !selectedTypes.includes(t.id));

  return (
    <div className="space-y-6 animate-pixel-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-3xl animate-float" style={{ animationDuration: '5s', color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}>⊞</span>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <span className="text-gradient">SECUENCIA</span>
          </h1>
          <div className="mt-1 text-xs tracking-[3px] text-purple-300/40" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ● CREADOR DE SECUENCIAS DE JUEGOS
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />

      {error && (
        <div className="p-3 rounded-xl text-xs text-center text-neon-pink" style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.2)' }}>
          {error}
        </div>
      )}

      {/* Title + Topic */}
      <div className="glass rounded-2xl p-6 neon-border-cyan space-y-4" style={{ borderRadius: '24px' }}>
        <h2 className="text-sm font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          INFORMACION DE LA SECUENCIA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>Titulo</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="EJ: MATEMATICAS DIVERTIDAS" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none" style={{ fontFamily: "'Orbitron', sans-serif" }} />
          </div>
          <div>
            <label className="text-[10px] text-purple-300/50 tracking-[3px] uppercase block mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>Tema</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="EJ: ALGEBRA, GEOGRAFIA, ..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none" style={{ fontFamily: "'Orbitron', sans-serif" }} />
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="glass rounded-2xl p-6 neon-border-purple space-y-4" style={{ borderRadius: '24px' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            JUEGOS EN LA SECUENCIA ({steps.length})
          </h2>
          <div className="flex gap-2">
            {availableTemplates.length > 0 && (
              <select onChange={e => { if (e.target.value) { addStep(e.target.value); e.target.value = ''; } }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px]" style={{ fontFamily: "'Orbitron', sans-serif", color: '#fff', background: '#1a0533' }}>
                <option value="" style={{ color: '#fff', background: '#1a0533' }}>+ Agregar juego</option>
                {availableTemplates.map(t => (
                  <option key={t.id} value={t.id} style={{ color: '#fff', background: '#1a0533' }}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {steps.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3" style={{ color: 'rgba(0,245,255,0.2)' }}>◈</div>
            <div className="text-xs text-purple-300/50 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              SELECCIONA UN JUEGO PARA EMPEZAR
            </div>
          </div>
        )}

        {steps.map((step, idx) => {
          const tpl = ALL_TEMPLATES.find(t => t.id === step.templateType);
          return (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neon-cyan" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>
                    #{idx + 1}
                  </span>
                  <span style={{ color: tpl?.color, textShadow: `0 0 8px ${tpl?.color}40` }}>{tpl?.icon}</span>
                  <span className="text-[10px] tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", color: tpl?.color }}>{tpl?.name}</span>
                </div>
                <button onClick={() => removeStep(idx)} className="text-[9px] text-neon-pink/50 hover:text-neon-pink">ELIMINAR</button>
              </div>

              <input value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)} placeholder="Titulo de este juego (EJ: Sumas basicas)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-purple-400/30 focus:border-neon-cyan/50" style={{ fontFamily: "'Orbitron', sans-serif" }} />

              {/* Rules for this step */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[8px] text-purple-400/40 tracking-wider block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>TIEMPO (SEG)</label>
                  <input type="number" min={0} value={step.rules.timeLimitSec} onChange={e => updateStepRules(idx, 'timeLimitSec', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] text-center focus:border-neon-cyan/50" />
                </div>
                <div>
                  <label className="text-[8px] text-purple-400/40 tracking-wider block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>VIDAS</label>
                  <input type="number" min={1} max={20} value={step.rules.lives} onChange={e => updateStepRules(idx, 'lives', parseInt(e.target.value) || 3)} className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] text-center focus:border-neon-cyan/50" />
                </div>
                <div>
                  <label className="text-[8px] text-purple-400/40 tracking-wider block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>PUNTOS</label>
                  <input type="number" min={10} max={1000} value={step.rules.basePoints} onChange={e => updateStepRules(idx, 'basePoints', parseInt(e.target.value) || 100)} className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] text-center focus:border-neon-cyan/50" />
                </div>
              </div>

              {/* Content editor for this step */}
              <div className="pt-1">
                <div className="text-[9px] text-purple-300/50 tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>CONTENIDO:</div>
                <StepContentEditor templateType={step.templateType} content={step.content} onChange={(c: any) => updateStep(idx, 'content', c)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create button */}
      <button onClick={handleCreate} disabled={submitting || steps.length === 0}
        className="w-full py-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 btn-neon-pulse disabled:opacity-40"
        style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 20px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>
        {submitting ? 'CREANDO SECUENCIA...' : `CREAR SECUENCIA (${steps.length} JUEGO${steps.length !== 1 ? 'S' : ''})`}
      </button>
    </div>
  );
}
