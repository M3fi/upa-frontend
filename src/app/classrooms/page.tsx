'use client';

import { useState, useEffect } from 'react';

interface Classroom {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  const loadClassrooms = () => {
    setLoading(true);
    fetch('/api/classrooms', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar salones');
        return r.json();
      })
      .then((data) => {
        setClassrooms(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadClassrooms, []);

  const createClassroom = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setNewCode(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al crear');
      }
      const data = await res.json();
      setNewCode(data.code);
      setName('');
      setShowForm(false);
      loadClassrooms();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al crear salón');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-pixel-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-bold"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            <span className="text-gradient">SALONES</span>
          </h1>
          <div
            className="mt-2 text-xs tracking-[3px] text-purple-300/40"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ● GESTION DE AULAS VIRTUALES
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setNewCode(null); }}
          className="glitch-btn inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            background: 'linear-gradient(135deg, #FF006E, #7B2FBE)',
            color: '#fff',
            boxShadow: '0 0 15px rgba(255,0,110,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          + NUEVO SALON
        </button>
      </div>

      {/* Decorative line */}
      <div className="h-[1px] w-full" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)',
      }} />

      {/* Create form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 neon-border-cyan space-y-4" style={{ borderRadius: '24px' }}>
          <h2 className="text-sm font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            NUEVO SALON
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="NOMBRE DEL SALON"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createClassroom()}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
              autoFocus
            />
            <button
              onClick={createClassroom}
              disabled={creating || !name.trim()}
              className="px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 disabled:opacity-40"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(0,245,255,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '10px',
              }}
            >
              {creating ? '...' : 'CREAR'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CANCELAR
            </button>
          </div>

          {/* Show generated code */}
          {newCode && (
            <div className="p-4 rounded-xl bg-white/5 border border-neon-yellow/30 text-center">
              <div className="text-xs text-purple-300/60 mb-2 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                CODIGO DE ACCESO DEL SALON
              </div>
              <div
                className="text-2xl font-bold tracking-[6px] text-neon-yellow"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: '0 0 20px rgba(255,214,10,0.4)',
                }}
              >
                {newCode}
              </div>
              <div className="text-[10px] text-purple-400/40 mt-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                COMPARTE ESTE CODIGO CON TUS ESTUDIANTES
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 neon-border-purple loading-shimmer" style={{ borderRadius: '24px', minHeight: '120px' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-2xl p-8 text-center neon-border-pink" style={{ borderRadius: '24px' }}>
          <div className="text-4xl mb-4" style={{ color: '#FF006E' }}>⚠</div>
          <div className="text-sm text-neon-pink tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>ERROR DEL SISTEMA</div>
          <div className="text-xs text-purple-300/50">{error}</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && classrooms.length === 0 && !showForm && (
        <div className="glass rounded-2xl p-12 sm:p-16 text-center neon-border-magenta" style={{ borderRadius: '24px' }}>
          <div className="text-6xl mb-6 animate-float" style={{ animationDuration: '5s', animationDelay: '-1s', color: 'rgba(255,0,255,0.3)', textShadow: '0 0 20px rgba(255,0,255,0.2)' }}>▣</div>
          <div className="text-sm text-neon-magenta tracking-widest mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>NO HAY SALONES CREADOS</div>
          <div className="text-xs text-purple-300/50 tracking-wider leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            CREA UN SALON PARA EMPEZAR A ASIGNAR JUEGOS A TUS ESTUDIANTES.
          </div>
        </div>
      )}

      {/* Classrooms Grid */}
      {!loading && !error && classrooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classrooms.map((c, idx) => (
            <div
              key={c.id}
              className="glass rounded-2xl p-5 neon-border-purple group hover:translate-y-[-6px] transition-all duration-300"
              style={{ borderRadius: '24px', animation: `pixelIn 0.5s ease-out ${0.05 * idx}s both` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" style={{ color: '#FF00FF', textShadow: '0 0 10px rgba(255,0,255,0.3)' }}>▣</span>
                <h3 className="text-sm font-bold text-white tracking-wider flex-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{c.name}</h3>
              </div>
              <div
                className="text-center py-3 px-3 rounded-lg bg-white/5 border border-white/5 mb-2"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                <div className="text-[10px] text-purple-400/40 mb-1 tracking-[3px]" style={{ fontFamily: "'Orbitron', sans-serif" }}>CODIGO</div>
                <div className="text-sm tracking-[4px] text-neon-yellow" style={{ textShadow: '0 0 10px rgba(255,214,10,0.3)' }}>{c.code}</div>
              </div>
              <div className="text-[9px] text-purple-400/30 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                CREADO: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
