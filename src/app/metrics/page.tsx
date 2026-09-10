'use client';

import { useState, useEffect } from 'react';

interface Game {
  id: string;
  templateType: string;
  title: string;
  createdAt: string;
}

interface ScoreData {
  totalScore: number;
  gamesPlayed: number;
  scores: { gameId: string; score: number; completedAt: string }[];
}

interface Classroom {
  id: string;
  name: string;
  code: string;
}

export default function MetricsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    if (!token) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        if (userRole === 'TEACHER') {
          // Teacher: load games + classrooms
          const [gamesRes, classroomsRes] = await Promise.all([
            fetch('/api/games', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('/api/classrooms', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          if (gamesRes.ok) setGames(await gamesRes.json());
          if (classroomsRes.ok) setClassrooms(await classroomsRes.json());
        } else {
          // Student: load scores + assignments
          const [scoresRes, assignRes] = await Promise.all([
            fetch('/api/scores/me', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('/api/assignments', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          if (scoresRes.ok) setScoreData(await scoresRes.json());
          if (assignRes.ok) {
            // Try to get classrooms from assignments
            try {
              const assigns = await assignRes.json();
              if (Array.isArray(assigns) && assigns.length > 0) {
                // If assignments have classroom info, use it
                setClassrooms(assigns.map((a: { classroomId?: string; id: string; classroomName?: string; name?: string; classroomCode?: string; code?: string }) => ({
                  id: a.classroomId || a.id,
                  name: a.classroomName || 'Salón asignado',
                  code: a.classroomCode || a.code || '---',
                })));
              }
            } catch { /* ignore */ }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const colorMap: Record<string, string> = {
    'neon-cyan': '#00F5FF',
    'neon-purple': '#7B2FBE',
    'neon-pink': '#FF006E',
    'neon-yellow': '#FFD60A',
  };

  const teacherMetrics = [
    { label: 'JUEGOS CREADOS', value: String(games.length), color: 'neon-cyan' as const, border: 'neon-border-cyan' as const, icon: '◆' },
    { label: 'SALONES ACTIVOS', value: String(classrooms.length), color: 'neon-purple' as const, border: 'neon-border-purple' as const, icon: '▣' },
    { label: 'TEMPLATES DISPONIBLES', value: '18', color: 'neon-pink' as const, border: 'neon-border-pink' as const, icon: '◇' },
    { label: 'ESTUDIANTES', value: '—', color: 'neon-yellow' as const, border: 'neon-border-yellow' as const, icon: '●' },
  ];

  const studentMetrics = [
    { label: 'PUNTAJE TOTAL', value: scoreData ? String(scoreData.totalScore) : '0', color: 'neon-cyan' as const, border: 'neon-border-cyan' as const, icon: '◆' },
    { label: 'JUEGOS JUGADOS', value: scoreData ? String(scoreData.gamesPlayed) : '0', color: 'neon-pink' as const, border: 'neon-border-pink' as const, icon: '◇' },
    { label: 'SALON ASIGNADO', value: classrooms.length > 0 ? classrooms[0].code : '—', color: 'neon-yellow' as const, border: 'neon-border-yellow' as const, icon: '●' },
    { label: 'PRECISION PROMEDIO', value: '—', color: 'neon-purple' as const, border: 'neon-border-purple' as const, icon: '◈' },
  ];

  const metrics = role === 'TEACHER' ? teacherMetrics : studentMetrics;

  if (loading) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          <span className="text-gradient">METRICAS</span>
        </h1>
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
        <div className="glass rounded-2xl p-12 text-center neon-border-cyan" style={{ borderRadius: '24px' }}>
          <div className="text-sm text-neon-cyan animate-pulse tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            CARGANDO DATOS...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-pixel-in">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          <span className="text-gradient">METRICAS</span>
        </h1>
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
        <div className="glass rounded-2xl p-8 text-center neon-border-pink" style={{ borderRadius: '24px' }}>
          <div className="text-4xl mb-4" style={{ color: '#FF006E' }}>⚠</div>
          <div className="text-sm text-neon-pink tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>ERROR DEL SISTEMA</div>
          <div className="text-xs text-purple-300/50">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pixel-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-3xl animate-float" style={{ animationDuration: '5s', color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
          ⊞
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <span className="text-gradient">METRICAS</span>
          </h1>
          <div className="mt-2 text-xs tracking-[3px] text-purple-300/40" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ● ESTADISTICAS Y ANALISIS
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <div
            key={m.label}
            className={`glass rounded-2xl p-6 ${m.border} stat-card group`}
            style={{
              borderRadius: '24px',
              animation: `pixelIn 0.5s ease-out ${0.08 * idx}s both`,
            }}
          >
            <div
              className="text-2xl mb-3 animate-float"
              style={{
                color: colorMap[m.color],
                textShadow: `0 0 15px ${colorMap[m.color]}44`,
                animationDelay: `${idx * 0.5}s`,
              }}
            >
              {m.icon}
            </div>
            <div
              className="text-3xl sm:text-4xl font-bold mb-2 tracking-wider"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: colorMap[m.color],
                textShadow: `0 0 20px ${colorMap[m.color]}44`,
              }}
            >
              {m.value}
            </div>
            <div
              className="text-[10px] sm:text-xs text-purple-300/50 tracking-[3px] uppercase"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Teacher: Games list */}
      {role === 'TEACHER' && games.length > 0 && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-purple" style={{ borderRadius: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl" style={{ color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.3)' }}>◆</span>
            <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              MIS JUEGOS ({games.length})
            </h2>
          </div>
          <div className="space-y-2">
            {games.map((g, idx) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                style={{ animation: `pixelIn 0.3s ease-out ${0.05 * idx}s both` }}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neon-cyan/60 tracking-[3px] uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {g.templateType}
                  </span>
                  <span className="text-xs text-white tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {g.title}
                  </span>
                </div>
                <span className="text-[9px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {new Date(g.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student: Score history */}
      {role !== 'TEACHER' && scoreData && scoreData.scores.length > 0 && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-purple" style={{ borderRadius: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl" style={{ color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.3)' }}>◆</span>
            <h2 className="text-base sm:text-lg font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              HISTORIAL DE PUNTUACIONES
            </h2>
          </div>
          <div className="space-y-2">
            {scoreData.scores.map((s) => (
              <div key={s.gameId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-purple-300/50 tracking-wider truncate flex-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  JUEGO: {s.gameId.substring(0, 8)}
                </span>
                <span className="text-xs font-bold text-neon-yellow mx-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  +{s.score}
                </span>
                <span className="text-[8px] text-purple-400/30 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {new Date(s.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student: Classroom info */}
      {role !== 'TEACHER' && classrooms.length > 0 && (
        <div className="glass rounded-2xl p-6 sm:p-8 neon-border-yellow" style={{ borderRadius: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl" style={{ color: '#FFD60A', textShadow: '0 0 10px rgba(255,214,10,0.3)' }}>▣</span>
            <h2 className="text-base sm:text-lg font-bold text-neon-yellow tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              MI SALON
            </h2>
          </div>
          <div className="space-y-3">
            {classrooms.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm text-white tracking-wider mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {c.name}
                  </div>
                  <div className="text-[9px] text-purple-400/40 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    CODIGO DE ACCESO
                  </div>
                </div>
                <div className="text-lg font-bold tracking-[4px] px-4 py-2 rounded-lg" style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: '#FFD60A',
                  background: 'rgba(255,214,10,0.1)',
                  border: '1px solid rgba(255,214,10,0.3)',
                  textShadow: '0 0 10px rgba(255,214,10,0.3)',
                  fontSize: '14px',
                }}>
                  {c.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {role === 'TEACHER' && games.length === 0 && (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center neon-border-purple" style={{ borderRadius: '24px' }}>
          <div className="text-5xl mb-6 animate-float" style={{ animationDuration: '7s', color: 'rgba(0,245,255,0.2)', textShadow: '0 0 20px rgba(0,245,255,0.1)' }}>
            ⟐
          </div>
          <div className="text-sm text-purple-300/50 tracking-wider mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            NO HAY DATOS SUFICIENTES PARA MOSTRAR GRAFICOS
          </div>
          <a href="/builder" className="inline-block px-6 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300"
            style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 15px rgba(255,0,110,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            CREAR MI PRIMER JUEGO
          </a>
        </div>
      )}
    </div>
  );
}
