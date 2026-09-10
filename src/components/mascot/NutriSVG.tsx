'use client';

export type SchoolTool =
  | 'ruler'
  | 'pencil'
  | 'compass'
  | 'eraser'
  | 'calculator'
  | 'book'
  | 'flask';

interface NutriSVGProps {
  mood?: 'idle' | 'talking' | 'excited' | 'thinking';
  toolItem?: SchoolTool | null;
  size?: number;
}

export function NutriSVG(props: NutriSVGProps) {
  const { toolItem = null, size = 130 } = props;
  const aspectRatio = 620 / 560;

  return (
    <svg
      width={size}
      height={size * aspectRatio}
      viewBox="0 0 560 620"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lic. Andrés Nutrialenz, mascota de Upa!"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* ── COLA ── */}
      <rect x="56"  y="456" width="48" height="32" fill="#5c3820" />
      <rect x="40"  y="480" width="48" height="32" fill="#5c3820" />
      <rect x="32"  y="504" width="40" height="24" fill="#6b4226" />
      <rect x="40"  y="520" width="32" height="16" fill="#7d5a38" />
      <rect x="48"  y="488" width="48" height="8"  fill="#4a2c16" />

      {/* ── PATAS ── */}
      <rect x="152" y="552" width="88" height="32" fill="#5c3820" />
      <rect x="320" y="552" width="88" height="32" fill="#5c3820" />
      <rect x="144" y="576" width="24" height="16" fill="#4a2c16" />
      <rect x="168" y="576" width="24" height="16" fill="#4a2c16" />
      <rect x="192" y="576" width="24" height="16" fill="#4a2c16" />
      <rect x="320" y="576" width="24" height="16" fill="#4a2c16" />
      <rect x="344" y="576" width="24" height="16" fill="#4a2c16" />
      <rect x="368" y="576" width="24" height="16" fill="#4a2c16" />

      {/* ── CUERPO ── */}
      <rect x="136" y="368" width="288" height="200" fill="#7d5a38" />
      <rect x="208" y="376" width="144" height="184" fill="#e8d4b4" />
      <rect x="136" y="368" width="24"  height="200" fill="#5c3820" />
      <rect x="400" y="368" width="24"  height="200" fill="#5c3820" />

      {/* ── BATA ── */}
      <rect x="112" y="376" width="104" height="192" fill="#f0f4ff" />
      <rect x="112" y="376" width="16"  height="192" fill="#d0ddf0" />
      <rect x="344" y="376" width="104" height="192" fill="#f0f4ff" />
      <rect x="432" y="376" width="16"  height="192" fill="#d0ddf0" />
      {/* Solapas V */}
      <rect x="208" y="376" width="16" height="80" fill="#f0f4ff" />
      <rect x="200" y="392" width="16" height="64" fill="#f0f4ff" />
      <rect x="192" y="416" width="16" height="40" fill="#f0f4ff" />
      <rect x="336" y="376" width="16" height="80" fill="#f0f4ff" />
      <rect x="344" y="392" width="16" height="64" fill="#f0f4ff" />
      <rect x="352" y="416" width="16" height="40" fill="#f0f4ff" />
      {/* Bolsillos */}
      <rect x="128" y="488" width="64" height="56" fill="#f0f4ff" />
      <rect x="128" y="488" width="64" height="8"  fill="#c8d4e8" />
      <rect x="128" y="488" width="8"  height="56" fill="#c8d4e8" />
      <rect x="184" y="488" width="8"  height="56" fill="#c8d4e8" />
      <rect x="368" y="488" width="64" height="56" fill="#f0f4ff" />
      <rect x="368" y="488" width="64" height="8"  fill="#c8d4e8" />
      <rect x="368" y="488" width="8"  height="56" fill="#c8d4e8" />
      <rect x="424" y="488" width="8"  height="56" fill="#c8d4e8" />

      {/* ── BRAZOS ── */}
      <rect x="72"  y="400" width="64" height="24" fill="#7d5a38" />
      <rect x="72"  y="424" width="72" height="24" fill="#7d5a38" />
      <rect x="72"  y="448" width="80" height="24" fill="#7d5a38" />
      <rect x="72"  y="400" width="16" height="72" fill="#5c3820" />
      <rect x="64"  y="464" width="80" height="32" fill="#5c3820" />
      <rect x="56"  y="480" width="24" height="16" fill="#4a2c16" />
      <rect x="80"  y="488" width="24" height="16" fill="#4a2c16" />
      <rect x="104" y="480" width="24" height="16" fill="#4a2c16" />
      <rect x="424" y="400" width="64" height="24" fill="#7d5a38" />
      <rect x="416" y="424" width="72" height="24" fill="#7d5a38" />
      <rect x="408" y="448" width="80" height="24" fill="#7d5a38" />
      <rect x="472" y="400" width="16" height="72" fill="#5c3820" />
      <rect x="416" y="464" width="80" height="32" fill="#5c3820" />
      <rect x="416" y="480" width="24" height="16" fill="#4a2c16" />
      <rect x="440" y="488" width="24" height="16" fill="#4a2c16" />
      <rect x="464" y="480" width="24" height="16" fill="#4a2c16" />

      {/* ── CUELLO ── */}
      <rect x="224" y="336" width="112" height="40" fill="#c49a72" />
      <rect x="224" y="336" width="16"  height="40" fill="#b08862" />
      <rect x="320" y="336" width="16"  height="40" fill="#b08862" />

      {/* ── CABEZA ── */}
      <rect x="96"  y="152" width="368" height="192" fill="#c49a72" />
      <rect x="112" y="144" width="336" height="16"  fill="#c49a72" />
      <rect x="128" y="136" width="304" height="16"  fill="#c49a72" />
      <rect x="112" y="336" width="336" height="8"   fill="#c49a72" />
      {/* Parte alta más oscura */}
      <rect x="128" y="136" width="304" height="80"  fill="#a07848" />
      <rect x="96"  y="152" width="368" height="56"  fill="#a07848" />
      {/* Zona facial */}
      <rect x="160" y="208" width="240" height="136" fill="#d4b896" />
      {/* Hocico crema */}
      <rect x="184" y="256" width="192" height="88"  fill="#e8d4b4" />

      {/* ── OREJAS ── */}
      <rect x="56"  y="176" width="56" height="56" fill="#7d5a38" />
      <rect x="64"  y="184" width="32" height="32" fill="#c49a72" />
      <rect x="56"  y="176" width="8"  height="56" fill="#5c3820" />
      <rect x="56"  y="224" width="56" height="8"  fill="#5c3820" />
      <rect x="448" y="176" width="56" height="56" fill="#7d5a38" />
      <rect x="464" y="184" width="32" height="32" fill="#c49a72" />
      <rect x="496" y="176" width="8"  height="56" fill="#5c3820" />
      <rect x="448" y="224" width="56" height="8"  fill="#5c3820" />

      {/* ── OJOS ── */}
      {/* Ojo izquierdo */}
      <rect x="144" y="208" width="80" height="80" fill="#1a0a00" />
      <rect x="152" y="200" width="64" height="8"  fill="#1a0a00" />
      <rect x="152" y="288" width="64" height="8"  fill="#1a0a00" />
      <rect x="136" y="216" width="8"  height="64" fill="#1a0a00" />
      <rect x="224" y="216" width="8"  height="64" fill="#1a0a00" />
      <rect x="152" y="208" width="64" height="80" fill="#100800" />
      <rect x="160" y="216" width="20" height="20" fill="#ffffff" />
      <rect x="192" y="264" width="12" height="12" fill="#ffffff" opacity="0.6" />
      {/* Ojo derecho */}
      <rect x="336" y="208" width="80" height="80" fill="#1a0a00" />
      <rect x="344" y="200" width="64" height="8"  fill="#1a0a00" />
      <rect x="344" y="288" width="64" height="8"  fill="#1a0a00" />
      <rect x="328" y="216" width="8"  height="64" fill="#1a0a00" />
      <rect x="416" y="216" width="8"  height="64" fill="#1a0a00" />
      <rect x="344" y="208" width="64" height="80" fill="#100800" />
      <rect x="352" y="216" width="20" height="20" fill="#ffffff" />
      <rect x="384" y="264" width="12" height="12" fill="#ffffff" opacity="0.6" />

      {/* ── HOCICO Y NARIZ ── */}
      <rect x="192" y="272" width="176" height="72" fill="#c8a882" />
      <rect x="200" y="264" width="160" height="8"  fill="#c8a882" />
      <rect x="224" y="272" width="112" height="48" fill="#5c3820" />
      <rect x="232" y="264" width="96"  height="8"  fill="#5c3820" />
      <rect x="216" y="280" width="8"   height="32" fill="#5c3820" />
      <rect x="336" y="280" width="8"   height="32" fill="#5c3820" />
      <rect x="240" y="280" width="24"  height="12" fill="#7d5a38" />
      <rect x="248" y="280" width="8"   height="8"  fill="#9a7050" opacity="0.8" />

      {/* ── MEJILLAS ── */}
      <rect x="112" y="288" width="56" height="24" fill="#f2b8a0" opacity="0.75" />
      <rect x="120" y="280" width="40" height="8"  fill="#f2b8a0" opacity="0.5" />
      <rect x="120" y="312" width="40" height="8"  fill="#f2b8a0" opacity="0.5" />
      <rect x="392" y="288" width="56" height="24" fill="#f2b8a0" opacity="0.75" />
      <rect x="400" y="280" width="40" height="8"  fill="#f2b8a0" opacity="0.5" />
      <rect x="400" y="312" width="40" height="8"  fill="#f2b8a0" opacity="0.5" />

      {/* ── BIGOTES ── */}
      <rect x="32"  y="292" width="88" height="4" fill="#e0ccaa" opacity="0.95" />
      <rect x="40"  y="308" width="80" height="4" fill="#e0ccaa" opacity="0.95" />
      <rect x="48"  y="324" width="72" height="4" fill="#e0ccaa" opacity="0.9" />
      <rect x="440" y="292" width="88" height="4" fill="#e0ccaa" opacity="0.95" />
      <rect x="440" y="308" width="80" height="4" fill="#e0ccaa" opacity="0.95" />
      <rect x="440" y="324" width="72" height="4" fill="#e0ccaa" opacity="0.9" />

      {/* ── BIRRETE ── */}
      <rect x="160" y="136" width="240" height="24" fill="#2e1a5c" />
      <rect x="192" y="96"  width="176" height="48" fill="#3d2475" />
      <rect x="192" y="96"  width="176" height="8"  fill="#5230a0" />
      <rect x="192" y="136" width="176" height="8"  fill="#281660" />
      <rect x="88"  y="112" width="384" height="24" fill="#3d2475" />
      <rect x="88"  y="112" width="384" height="8"  fill="#5230a0" />
      <rect x="88"  y="128" width="384" height="8"  fill="#281660" />
      {/* Borla */}
      <rect x="432" y="112" width="8"  height="32" fill="#7744b8" />
      <rect x="440" y="136" width="16" height="8"  fill="#7744b8" />
      <rect x="448" y="144" width="8"  height="24" fill="#7744b8" />
      <rect x="440" y="160" width="32" height="32" fill="#8855cc" />
      <rect x="448" y="152" width="16" height="8"  fill="#8855cc" />
      <rect x="440" y="184" width="32" height="8"  fill="#6633a0" />
      <rect x="440" y="192" width="8"  height="24" fill="#7744b8" />
      <rect x="448" y="192" width="8"  height="32" fill="#7744b8" />
      <rect x="456" y="192" width="8"  height="24" fill="#7744b8" />
      <rect x="464" y="192" width="8"  height="16" fill="#7744b8" />

      {/* ── ÚTIL ESCOLAR ── */}
      {toolItem && <NutriToolItem tool={toolItem} />}
    </svg>
  );
}

function NutriToolItem({ tool }: { tool: SchoolTool }) {
  const items: Record<SchoolTool, JSX.Element> = {
    ruler: (
      <g>
        <rect x="370" y="390" width="96" height="24" fill="#f5d76e" stroke="#b8960a" strokeWidth="2" />
        <rect x="378" y="390" width="8" height="12" fill="#b8960a" opacity="0.5" />
        <rect x="394" y="390" width="8" height="12" fill="#b8960a" opacity="0.5" />
        <rect x="410" y="390" width="8" height="12" fill="#b8960a" opacity="0.5" />
        <rect x="426" y="390" width="8" height="12" fill="#b8960a" opacity="0.5" />
      </g>
    ),
    pencil: (
      <g>
        <rect x="410" y="350" width="16" height="96" fill="#f5d76e" stroke="#b8960a" strokeWidth="2" />
        <rect x="410" y="350" width="16" height="16" fill="#f4a460" />
        <polygon points="410,446 426,446 418,470" fill="#f5d76e" stroke="#b8960a" strokeWidth="1" />
        <polygon points="412,462 424,462 418,470" fill="#444" />
      </g>
    ),
    compass: (
      <g>
        <line x1="418" y1="360" x2="400" y2="450" stroke="#888" strokeWidth="4" strokeLinecap="round" />
        <line x1="418" y1="360" x2="436" y2="450" stroke="#888" strokeWidth="4" strokeLinecap="round" />
        <circle cx="418" cy="360" r="8" fill="#aaa" stroke="#666" strokeWidth="2" />
        <line x1="400" y1="450" x2="396" y2="462" stroke="#555" strokeWidth="3" />
        <line x1="436" y1="450" x2="440" y2="462" stroke="#555" strokeWidth="3" />
      </g>
    ),
    eraser: (
      <g>
        <rect x="378" y="400" width="72" height="40" fill="#ff8fb1" stroke="#cc5577" strokeWidth="2" />
        <rect x="378" y="400" width="72" height="16" fill="#ffb3cc" />
        <rect x="378" y="432" width="72" height="8"  fill="#cc5577" />
      </g>
    ),
    calculator: (
      <g>
        <rect x="380" y="370" width="72" height="96" rx="8" fill="#e8eaf6" stroke="#5c6bc0" strokeWidth="2" />
        <rect x="388" y="378" width="56" height="24" fill="#c5cae9" />
        <rect x="388" y="410" width="16" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="412" y="410" width="16" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="436" y="410" width="16" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="388" y="430" width="16" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="412" y="430" width="16" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="436" y="430" width="16" height="12" fill="#ef5350" opacity="0.8" />
        <rect x="388" y="450" width="40" height="12" fill="#5c6bc0" opacity="0.7" />
        <rect x="436" y="450" width="16" height="12" fill="#66bb6a" opacity="0.8" />
      </g>
    ),
    book: (
      <g>
        <rect x="368" y="370" width="88" height="104" rx="4" fill="#e53935" stroke="#b71c1c" strokeWidth="2" />
        <rect x="376" y="370" width="72" height="104" fill="#ef5350" />
        <line x1="412" y1="370" x2="412" y2="474" stroke="#b71c1c" strokeWidth="2" />
        <rect x="384" y="390" width="48" height="6" fill="#fff" opacity="0.6" />
        <rect x="384" y="404" width="48" height="6" fill="#fff" opacity="0.6" />
        <rect x="384" y="418" width="32" height="6" fill="#fff" opacity="0.6" />
      </g>
    ),
    flask: (
      <g>
        <rect x="408" y="360" width="24" height="32" fill="#b3e5fc" stroke="#0288d1" strokeWidth="2" />
        <polygon points="400,392 440,392 456,448 384,448" fill="#b3e5fc" stroke="#0288d1" strokeWidth="2" />
        <rect x="384" y="424" width="72" height="24" fill="#0288d1" opacity="0.4" />
        <rect x="402" y="360" width="36" height="8" fill="#80deea" stroke="#0288d1" strokeWidth="1" />
      </g>
    ),
  };
  return items[tool] ?? null;
}
