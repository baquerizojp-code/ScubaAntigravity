const LogoSVG = ({ className = "w-48 h-48", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 200 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Location pin outline */}
    <path
      d="M100 18
         C54 18 20 52 20 92
         C20 114 30 132 44 150
         L100 216
         L156 150
         C170 132 180 114 180 92
         C180 52 146 18 100 18Z"
      stroke={color}
      strokeWidth="9"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />

    {/* Strap / headband arc — open arc from left side over top to right side */}
    <path
      d="M46 86
         C50 52 72 36 100 36
         C128 36 150 52 154 86"
      stroke={color}
      strokeWidth="8.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Left side buckle — short connector between strap end and mask */}
    <rect x="42" y="80" width="12" height="14" rx="3" stroke={color} strokeWidth="5" fill="none" />

    {/* Right side buckle — short connector between strap end and mask */}
    <rect x="146" y="80" width="12" height="14" rx="3" stroke={color} strokeWidth="5" fill="none" />

    {/* Mask — single continuous frame with two lens openings and nose */}
    {/* Outer mask frame */}
    <path
      d="M54 78
         C54 70 60 64 70 64
         L90 64
         C94 64 97 66 100 70
         C103 66 106 64 110 64
         L130 64
         C140 64 146 70 146 78
         L146 92
         C146 102 140 108 130 108
         L118 108
         C112 108 108 106 105 102
         L100 96
         L95 102
         C92 106 88 108 82 108
         L70 108
         C60 108 54 102 54 92Z"
      stroke={color}
      strokeWidth="7"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Left lens cutout — slightly recessed */}
    <path
      d="M62 80
         C62 74 66 70 72 70
         L86 70
         C89 70 91 72 92 75
         L93 80
         C94 86 92 92 88 96
         C84 100 78 102 72 100
         C66 98 62 90 62 80Z"
      fill={color}
      opacity="0.15"
    />

    {/* Right lens cutout */}
    <path
      d="M138 80
         C138 74 134 70 128 70
         L114 70
         C111 70 109 72 108 75
         L107 80
         C106 86 108 92 112 96
         C116 100 122 102 128 100
         C134 98 138 90 138 80Z"
      fill={color}
      opacity="0.15"
    />

    {/* Nose piece — prominent triangular/heart shape hanging below mask */}
    <path
      d="M88 108
         C88 108 90 116 94 122
         C96 126 100 128 100 128
         C100 128 104 126 106 122
         C110 116 112 108 112 108"
      stroke={color}
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Inner nose detail — V shape */}
    <path
      d="M94 114 L100 122 L106 114"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Bottom dot below pin point */}
    <circle cx="100" cy="230" r="7" fill={color} />
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

        {/* Small sizes in context */}
        <div className="md:col-span-2 bg-muted rounded-2xl p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">Tamaños en contexto (navbar, headers)</h2>
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
