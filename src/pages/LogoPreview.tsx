const LogoSVG = ({ className = "w-48 h-48", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 200 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* PIN OUTLINE */}
    <path
      d="M100 14 C50 14 16 48 16 94 C16 120 28 142 46 164 L100 226 L154 164 C172 142 184 120 184 94 C184 48 150 14 100 14Z"
      stroke={color}
      strokeWidth="8"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />

    {/* STRAP / HEADBAND ARC over top */}
    <path
      d="M36 90 C40 48 66 30 100 30 C134 30 160 48 164 90"
      stroke={color}
      strokeWidth="9"
      strokeLinecap="round"
      fill="none"
    />

    {/* LEFT LENS — large horizontal oval */}
    <ellipse
      cx="68"
      cy="90"
      rx="28"
      ry="18"
      stroke={color}
      strokeWidth="7"
      fill="none"
    />

    {/* RIGHT LENS — large horizontal oval */}
    <ellipse
      cx="132"
      cy="90"
      rx="28"
      ry="18"
      stroke={color}
      strokeWidth="7"
      fill="none"
    />

    {/* NOSE BRIDGE — connects the two lenses at center top */}
    <path
      d="M96 84 C98 78 102 78 104 84"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />

    {/* LEFT STRAP BUCKLE — small piece connecting strap to lens */}
    <path
      d="M38 86 L40 82 L40 96 L38 92"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* RIGHT STRAP BUCKLE */}
    <path
      d="M162 86 L160 82 L160 96 L162 92"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* NOSE PIECE — prominent triangle/skirt below mask center */}
    <path
      d="M84 104 C86 110 90 120 94 126 C96 130 100 134 100 134 C100 134 104 130 106 126 C110 120 114 110 116 104"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Inner nose V detail */}
    <path
      d="M92 116 L100 128 L108 116"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* BOTTOM DOT */}
    <circle cx="100" cy="242" r="7" fill={color} />
  </svg>
);

const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8 text-center">Logo Preview — Aprueba antes de aplicar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dark on Light</h2>
          <LogoSVG className="w-48 h-60" color="#0f5e5a" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="#0f5e5a" />
            <span className="text-xl font-bold" style={{ color: '#0f5e5a' }}>ScubaTrip</span>
          </div>
        </div>

        <div className="bg-ocean-900 rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider">Light on Dark</h2>
          <LogoSVG className="w-48 h-60" color="white" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="white" />
            <span className="text-xl font-bold text-white">ScubaTrip</span>
          </div>
        </div>

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
