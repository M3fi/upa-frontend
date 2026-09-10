'use client';

import { useState, useEffect } from 'react';

interface Game {
  id: string;
  templateType: string;
  title: string;
  createdAt: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesion activa');
      setLoading(false);
      return;
    }
    fetch('/api/games', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar juegos');
        return r.json();
      })
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          <span className="text-gradient">MIS JUEGOS</span>
        </h1>
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 neon-border-purple" style={{ borderRadius: '24px', minHeight: '140px', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))', animation: 'shimmer 2s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          <span className="text-gradient">MIS JUEGOS</span>
        </h1>
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
        <div className="glass rounded-2xl p-8 text-center neon-border-pink" style={{ borderRadius: '24px' }}>
          <div className="text-4xl mb-4" style={{ color: '#FF006E' }}>⚠</div>
          <div className="text-sm text-neon-pink tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>ERROR DEL SISTEMA</div>
          <div className="text-xs text-purple-300/50 mb-4">{error}</div>
          <a href="/"
            className="inline-block px-5 py-3 rounded-xl text-xs tracking-wider border border-white/10 text-purple-300/60 hover:text-white hover:border-white/30 transition-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ← VOLVER AL INICIO
          </a>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <span className="text-gradient">MIS JUEGOS</span>
            </h1>
            <div className="mt-2 text-xs tracking-[3px] text-purple-300/40" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ● COLECCION DE JUEGOS EDUCATIVOS
            </div>
          </div>
          <a href="/builder"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
            style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            + NUEVO
          </a>
        </div>
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
        <div className="glass rounded-2xl p-12 sm:p-16 text-center neon-border-cyan" style={{ borderRadius: '24px' }}>
          <div className="text-6xl mb-6 animate-float" style={{ animationDuration: '6s', color: 'rgba(0,245,255,0.3)', textShadow: '0 0 20px rgba(0,245,255,0.2)' }}>◆</div>
          <div className="text-sm text-neon-cyan tracking-widest mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>NO HAS CREADO JUEGOS TODAVIA</div>
          <a href="/builder" className="text-xs tracking-wider neon-link" style={{ fontFamily: "'Press Start 2P', monospace" }}>CREAR MI PRIMER JUEGO</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pixel-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <span className="text-gradient">MIS JUEGOS</span>
          </h1>
          <div className="mt-2 text-xs tracking-[3px] text-purple-300/40" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ● {games.length} JUEGO{(games.length !== 1) ? 'S' : ''} CREADO{(games.length !== 1) ? 'S' : ''}
          </div>
        </div>
        <a href="/builder"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
          style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          + NUEVO
        </a>
      </div>

      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {games.map((g, idx) => (
          <div key={g.id}
            className="glass rounded-2xl p-5 neon-border-purple transition-all duration-300"
            style={{ borderRadius: '24px', animation: `pixelIn 0.5s ease-out ${0.05 * idx}s both` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" style={{ color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.3)' }}>◆</span>
              <div className="text-[10px] text-neon-cyan/60 tracking-[3px] uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>{g.templateType}</div>
            </div>
            <h3 className="text-base font-bold text-white mb-2 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>{g.title}</h3>
            <div className="text-[9px] text-purple-400/30 tracking-wider mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              CREADO: {new Date(g.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <span className="flex-1 text-[9px] text-purple-400/40 tracking-wider self-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                ID: {g.id.substring(0, 8)}
              </span>
              <button
                onClick={() => window.location.href = `/play/${g.id}`}
                className="px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest transition-all duration-300"
                style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #7B2FBE, #00F5FF)', color: '#fff', boxShadow: '0 0 10px rgba(0,245,255,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                JUGAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
