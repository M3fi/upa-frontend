'use client';

import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ value, label, icon, color }: {
  value: number;
  label: string;
  icon: string;
  color: 'cyan' | 'magenta' | 'yellow';
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const neonMap = {
    cyan: { border: 'neon-border-cyan', glow: 'rgba(0,245,255,0.3)', text: 'text-neon-cyan', symColor: '#00F5FF' },
    magenta: { border: 'neon-border-magenta', glow: 'rgba(255,0,255,0.3)', text: 'text-neon-magenta', symColor: '#FF00FF' },
    yellow: { border: 'neon-border-yellow', glow: 'rgba(255,214,10,0.3)', text: 'text-neon-yellow', symColor: '#FFD60A' },
  };

  const n = neonMap[color];

  return (
    <div
      ref={ref}
      className={`stat-card glass rounded-2xl p-6 sm:p-8 ${n.border} relative overflow-hidden group cursor-default`}
      style={{ borderRadius: '24px' }}
    >
      <div className="stat-glow" style={{ background: `radial-gradient(ellipse at center, ${n.glow} 0%, transparent 70%)` }} />
      <div className="mb-4 animate-float text-3xl sm:text-4xl"
        style={{ animationDelay: `${color === 'cyan' ? 0 : color === 'magenta' ? 1.5 : 3}s`, color: n.symColor, textShadow: `0 0 20px ${n.glow}`, fontFamily: "'Orbitron', sans-serif" }}>
        {icon}
      </div>
      <div className={`text-4xl sm:text-5xl font-bold mb-2 ${n.text}`} style={{ fontFamily: "'Press Start 2P', monospace", textShadow: `0 0 20px ${n.glow}` }}>
        {count}
      </div>
      <div className="text-sm tracking-widest uppercase text-purple-200/60" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        {label}
      </div>
      <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${n.glow.replace('0.3', '0.8')}, transparent)` }} />
    </div>
  );
}

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerRole, setRegisterRole] = useState('TEACHER');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    const timer = setTimeout(() => setShowWelcome(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Credenciales inválidas');
      }
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.role);
      setToken(data.accessToken);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) { setLoginError('Ingresa nombre y apellido'); return; }
    if (loginPassword !== confirmPassword) { setLoginError('Las contraseñas no coinciden'); return; }
    if (loginPassword.length < 6) { setLoginError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          displayName: (firstName.trim() + ' ' + lastName.trim()).trim(),
          role: registerRole,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al registrarse');
      }
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.role);
      setToken(data.accessToken);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Login screen when no token
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-pixel-in">
        <div className="glass rounded-2xl p-8 sm:p-12 neon-border-cyan w-full max-w-md" style={{ borderRadius: '24px' }}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-4" style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>▲</div>
            <h1 className="text-xl font-bold text-gradient" style={{ fontFamily: "'Press Start 2P', monospace" }}>UPA!</h1>
            <div className="text-xs text-purple-300/40 mt-2 tracking-[3px]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {isRegister ? 'CREAR CUENTA' : 'PANEL DEL MAESTRO'}
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl text-xs text-center text-neon-pink" style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.2)' }}>
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            {isRegister ? (
              <>
                <div className="space-y-3">
                  <input type="text" placeholder="NOMBRE" value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }} autoFocus />
                  <input type="text" placeholder="APELLIDO" value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }} />
                </div>
                <input type="email" placeholder="EMAIL" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                  style={{ fontFamily: "'Orbitron', sans-serif" }} />

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="CONTRASENA" value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-neon-cyan transition-colors text-sm">
                    {showPassword ? '◉' : '◎'}
                  </button>
                </div>

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="CONFIRMAR CONTRASENA" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border text-white text-sm placeholder-purple-400/30 focus:outline-none transition-all tracking-wider ${
                      confirmPassword && loginPassword !== confirmPassword
                        ? 'border-neon-pink/50'
                        : 'border-white/10 focus:border-neon-cyan/50'
                    }`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }} />
                  {confirmPassword && loginPassword !== confirmPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neon-pink">✕</span>
                  )}
                </div>
                {confirmPassword && loginPassword === confirmPassword && loginPassword.length > 0 && (
                  <div className="text-[10px] text-neon-cyan/60 tracking-wider text-right" style={{ fontFamily: "'Orbitron', sans-serif" }}>✓ COINCIDEN</div>
                )}

                <div className="space-y-2 pt-1">
                  <div className="text-xs text-purple-300/50 tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>SELECCIONA UN ROL:</div>
                  <div className="flex gap-3">
                    <button onClick={() => setRegisterRole('TEACHER')}
                      className={`flex-1 py-3 rounded-xl text-xs tracking-wider font-bold transition-all duration-300 ${registerRole === 'TEACHER' ? 'neon-border-cyan' : 'border border-white/10 text-purple-300/50'}`}
                      style={{ background: registerRole === 'TEACHER' ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)', fontFamily: "'Press Start 2P', monospace", fontSize: '9px' }}>
                      MAESTRO
                    </button>
                    <button onClick={() => setRegisterRole('STUDENT')}
                      className={`flex-1 py-3 rounded-xl text-xs tracking-wider font-bold transition-all duration-300 ${registerRole === 'STUDENT' ? 'neon-border-yellow' : 'border border-white/10 text-purple-300/50'}`}
                      style={{ background: registerRole === 'STUDENT' ? 'rgba(255,214,10,0.08)' : 'rgba(255,255,255,0.02)', fontFamily: "'Press Start 2P', monospace", fontSize: '9px' }}>
                      ESTUDIANTE
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <input type="email" placeholder="EMAIL" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                  style={{ fontFamily: "'Orbitron', sans-serif" }} autoFocus />

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="CONTRASENA" value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-purple-400/30 focus:border-neon-cyan/50 focus:outline-none transition-all tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-neon-cyan transition-colors text-sm">
                    {showPassword ? '◉' : '◎'}
                  </button>
                </div>
              </>
            )}

            <button onClick={isRegister ? handleRegister : handleLogin}
              disabled={loggingIn}
              className="w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 btn-neon-pulse disabled:opacity-40"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(135deg, #FF006E, #7B2FBE)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(255,0,110,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '11px',
              }}>
              {loggingIn ? 'PROCESANDO...' : isRegister ? 'CREAR CUENTA' : 'INGRESAR'}
            </button>
          </div>

          <div className="mt-5 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setLoginError(''); }}
              className="text-[10px] text-purple-400/40 hover:text-neon-cyan transition-colors tracking-wider underline underline-offset-4"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {isRegister ? 'YA TENGO CUENTA — INGRESAR' : 'CREAR CUENTA NUEVA'}
            </button>
          </div>

          {!isRegister && (
            <div className="mt-4 text-center">
              <div className="text-[10px] text-purple-400/30 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                teacher@upa.com / password123
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pixel-in">
      {/* Header with logout */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <span className="text-gradient">PANEL DEL MAESTRO</span>
          </h1>
          <div className="mt-2 text-xs sm:text-sm tracking-[4px] text-purple-300/40 scanline-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ● SISTEMA OPERATIVO — v0.1.0-m0
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-[10px] px-3 py-2 rounded-lg tracking-wider border border-white/10 text-purple-400/40 hover:text-neon-pink hover:border-neon-pink/30 transition-all"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          SALIR
        </button>
      </div>

      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(255,0,110,0.5), transparent)' }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <AnimatedCounter value={0} label="Juegos creados" icon="◆" color="cyan" />
        <AnimatedCounter value={0} label="Salones activos" icon="▣" color="magenta" />
        <AnimatedCounter value={0} label="Estudiantes" icon="●" color="yellow" />
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8 neon-border-purple relative overflow-hidden" style={{ borderRadius: '24px' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,245,255,0.3) 20px, rgba(0,245,255,0.3) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,0,110,0.2) 20px, rgba(255,0,110,0.2) 21px)` }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl animate-pulse" style={{ animationDuration: '2s', color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.4)' }}>◎</span>
            <h2 className="text-lg sm:text-xl font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>ACTIVIDAD RECIENTE</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-6xl sm:text-7xl mb-6 animate-float" style={{ animationDuration: '6s', color: 'rgba(0,245,255,0.3)', textShadow: '0 0 30px rgba(0,245,255,0.2)', fontFamily: "'Orbitron', sans-serif" }}>◉</div>
            <div className="text-sm sm:text-base text-purple-300/50 tracking-widest mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {showWelcome ? <span className="typewriter" style={{ maxWidth: '320px' }}>NO HAY ACTIVIDAD REGISTRADA</span> : <span className="text-neon-cyan/30 animate-pulse">INICIALIZANDO...</span>}
            </div>
            <div className="text-xs text-purple-400/30 tracking-[3px]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {showWelcome ? 'CREA TU PRIMER JUEGO PARA EMPEZAR' : '―'}
            </div>
          </div>
        </div>
      </div>

      {showWelcome && (
        <div className="glass-strong rounded-2xl p-6 sm:p-10 relative overflow-hidden transition-all duration-700" style={{ borderRadius: '24px', border: '1px solid rgba(255,214,10,0.2)', boxShadow: '0 0 30px rgba(255,214,10,0.08), inset 0 0 30px rgba(255,214,10,0.03)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 50%, rgba(123,47,190,0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,245,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255,0,110,0.1) 0%, transparent 50%)` }} />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="text-5xl sm:text-6xl lg:text-7xl animate-float flex-shrink-0" style={{ animationDuration: '5s', color: '#FFD60A', textShadow: '0 0 20px rgba(255,214,10,0.4)', fontFamily: "'Orbitron', sans-serif" }}>▲</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style={{ fontFamily: "'Press Start 2P', monospace", lineHeight: 1.6, background: 'linear-gradient(90deg, #FFD60A, #FF006E, #00F5FF, #FFD60A)', backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'colorShift 4s linear infinite', fontSize: 'clamp(14px, 3vw, 20px)' }}>
                BIENVENIDO A UPA!
              </h2>
              <p className="text-sm sm:text-base text-purple-200/60 tracking-wider mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                CREA JUEGOS EDUCATIVOS, ASIGNALOS A TUS SALONES Y SIGUE EL PROGRESO DE TUS ESTUDIANTES EN TIEMPO REAL.
              </p>
              <a href="/builder" className="glitch-btn inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-widest transition-all duration-300 btn-neon-pulse group" style={{ fontFamily: "'Press Start 2P', monospace", background: 'linear-gradient(135deg, #FF006E, #7B2FBE)', color: '#fff', boxShadow: '0 0 20px rgba(255,0,110,0.4), 0 0 40px rgba(123,47,190,0.2)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '11px' }}>
                <span className="relative z-10">CREAR MI PRIMER JUEGO</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">▸</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
