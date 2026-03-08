const LogoSVG = ({ className = "w-48 h-48", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 200 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* ===== PIN OUTLINE ===== */}
    <path
      d="M100 14
         C50 14 16 48 16 92
         C16 118 28 140 46 162
         L100 224
         L154 162
         C172 140 184 118 184 92
         C184 48 150 14 100 14Z"
      stroke={color}
      strokeWidth="8"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />

    {/* ===== STRAP ARC — thick band over top ===== */}
    <path
      d="M38 88
         C42 50 68 32 100 32
         C132 32 158 50 162 88"
      stroke={color}
      strokeWidth="9"
      strokeLinecap="round"
      fill="none"
    />

    {/* ===== MASK FRAME — single wide continuous shape ===== */}
    {/* This is the main mask body: wide band with curved bottom for nose pocket */}
    <path
      d="M34 86
         L34 96
         C34 108 44 116 56 116
         L82 116
         C86 116 90 114 92 110
         L100 100
         L108 110
         C110 114 114 116 118 116
         L144 116
         C156 116 166 108 166 96
         L166 86
         C166 74 156 64 144 64
         L118 64
         C114 64 110 66 108 70
         L100 80
         L92 70
         C90 66 86 64 82 64
         L56 64
         C44 64 34 74 34 86Z"
      stroke={color}
      strokeWidth="7"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Left lens — subtle fill inside mask */}
    <path
      d="M42 86
         C42 78 48 72 56 72
         L80 72
         C83 72 86 74 87 76
         L92 84
         C92 84 90 92 86 98
         C82 104 76 108 68 108
         L56 108
         C48 108 42 100 42 92Z"
      fill={color}
      opacity="0.1"
    />

    {/* Right lens — subtle fill inside mask */}
    <path
      d="M158 86
         C158 78 152 72 144 72
         L120 72
         C117 72 114 74 113 76
         L108 84
         C108 84 110 92 114 98
         C118 104 124 108 132 108
         L144 108
         C152 108 158 100 158 92Z"
      fill={color}
      opacity="0.1"
    />

    {/* ===== NOSE PIECE — triangular shape below mask center ===== */}
    <path
      d="M86 116
         C88 122 92 132 100 136
         C108 132 112 122 114 116"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Inner nose V detail */}
    <path
      d="M92 124 L100 132 L108 124"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* ===== SIDE BUCKLES — small connectors between strap and mask ===== */}
    <line x1="36" y1="84" x2="36" y2="92" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="164" y1="84" x2="164" y2="92" stroke={color} strokeWidth="6" strokeLinecap="round" />

    {/* ===== BOTTOM DOT ===== */}
    <circle cx="100" cy="240" r="7" fill={color} />
  </svg>
);

const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8 text-center">Logo Preview — Aprueba antes de aplicar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Dark on light */}
        <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dark on Light</h2>
          <LogoSVG className="w-48 h-60" color="#0f5e5a" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="#0f5e5a" />
            <span className="text-xl font-bold" style={{ color: '#0f5e5a' }}>ScubaTrip</span>
          </div>
        </div>

        {/* Light on dark */}
        <div className="bg-ocean-900 rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider">Light on Dark</h2>
          <LogoSVG className="w-48 h-60" color="white" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="white" />
            <span className="text-xl font-bold text-white">ScubaTrip</span>
          </div>
        </div>

        {/* Sizes in context */}
        <div className="md:col-span-2 bg-muted rounded-2xl p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">Tamaños en contexto</h2>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="#0f5e5a" />
              <span className="font-bold text-foreground">ScubaTrip</span>
            </div>
            <div className="bg-ocean-900 rounded-lg px-4 py-2 flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="white" />
              <span className="font-bold text-white">ScubaTrip</span>
            </div>
            <div className="flex items-center gap-4">
              <LogoSVG className="w-5 h-7" color="#0f5e5a" />
              <LogoSVG className="w-8 h-10" color="#0f5e5a" />
              <LogoSVG className="w-12 h-16" color="#0f5e5a" />
              <LogoSVG className="w-20 h-24" color="#0f5e5a" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoPreview;
