import Link from 'next/link'

/* ── Inline SVG illustrations ── */
function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="18" cy="46" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="24" y1="22" x2="56" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="42" x2="56" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function NeedleThread({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="60" x2="60" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="62" cy="8" r="3" fill="currentColor" />
      <path d="M18 62 Q10 50, 20 42 Q30 34, 22 24 Q14 16, 24 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function MeasuringTape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="76" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      {[12, 22, 32, 42, 52, 62].map((x) => (
        <line key={x} x1={x} y1="8" x2={x} y2="16" stroke="currentColor" strokeWidth="1.5" />
      ))}
      {[17, 27, 37, 47, 57].map((x) => (
        <line key={x} x1={x} y1="8" x2={x} y2="13" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

function SewingMachine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="10" y="30" width="50" height="30" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Arm top */}
      <path d="M10 30 L10 15 Q10 10, 15 10 L50 10 Q55 10, 55 15 L55 30" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Needle */}
      <line x1="50" y1="30" x2="50" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Wheel */}
      <circle cx="65" cy="50" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="65" cy="50" r="2" fill="currentColor" />
      {/* Table */}
      <line x1="5" y1="60" x2="75" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Legs */}
      <line x1="15" y1="60" x2="12" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="60" x2="63" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Spool */}
      <rect x="25" y="4" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function ThreadSpool({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="10" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="20" cy="50" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="10" x2="8" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="32" y1="10" x2="32" y2="50" stroke="currentColor" strokeWidth="1.5" />
      {[18, 26, 34, 42].map((y) => (
        <ellipse key={y} cx="20" cy={y} rx="12" ry="3" stroke="currentColor" strokeWidth="0.8" opacity="0.4" fill="none" />
      ))}
    </svg>
  )
}

function ButtonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="15" cy="16" r="1.5" fill="currentColor" />
      <circle cx="25" cy="16" r="1.5" fill="currentColor" />
      <circle cx="15" cy="24" r="1.5" fill="currentColor" />
      <circle cx="25" cy="24" r="1.5" fill="currentColor" />
    </svg>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 bg-grid-subtle opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-tailor-pattern pointer-events-none" />

      {/* Floating background illustrations */}
      <ScissorsIcon className="absolute top-12 right-6 w-12 h-12 text-amber-200/50 animate-scissors" />
      <NeedleThread className="absolute top-32 left-4 w-10 h-10 text-amber-200/40 animate-float-slow" />
      <ButtonIcon className="absolute bottom-32 right-8 w-8 h-8 text-amber-200/40 animate-float" />
      <ThreadSpool className="absolute bottom-48 left-6 w-6 h-9 text-amber-200/30 animate-float-slow" />

      {/* Decorative dashed thread line */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,120 Q200,80 400,150 T800,100" stroke="#c8a96e" strokeWidth="2" fill="none" strokeDasharray="8 6" />
        <path d="M0,400 Q150,350 300,420 T600,380" stroke="#c8a96e" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
      </svg>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-md mx-auto px-6 min-h-screen flex flex-col items-center">
        {/* Spacer top */}
        <div className="flex-1" />
        {/* Sewing machine hero */}
        <div className="animate-fade-in-up mb-6">
          <div className="relative">
            <SewingMachine className="w-24 h-24 text-amber-700/70 mx-auto animate-float" />
            {/* Gold glow behind machine */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-amber-200/20 blur-2xl" />
          </div>
        </div>

        {/* Title block */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Supreme
            <span className="text-gold-gradient"> Tailors</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-400/60" />
            <MeasuringTape className="w-8 h-4 text-amber-500/60" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            Professional tailoring, perfectly managed.<br />
            <span className="text-xs text-slate-400">Precision in every stitch since 1995</span>
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {['📐 Measurements', '📦 Order Tracking', '📱 SMS Updates'].map((feat) => (
            <span key={feat} className="text-xs bg-white/80 border border-amber-100 text-slate-600 px-3 py-1.5 rounded-full shadow-sm">
              {feat}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3 mt-10 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <Link href="/login" className="btn-primary block text-center relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Login
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </Link>

          <Link href="/admin/login" className="btn-secondary block text-center group">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Portal
            </span>
          </Link>
        </div>

        {/* Spacer bottom */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="pb-6 text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-center gap-1 text-amber-600/40">
            <ScissorsIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-widest uppercase">Est. 1995</span>
            <ScissorsIcon className="w-3.5 h-3.5 scale-x-[-1]" />
          </div>
        </div>
      </div>
    </main>
  )
}
