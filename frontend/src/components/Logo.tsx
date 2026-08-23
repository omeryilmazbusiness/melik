export function Logo({ size = 'md', variant = 'default' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'light' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 34, text: 'text-xl sm:text-2xl' },
    lg: { icon: 42, text: 'text-3xl' },
  };
  const s = sizes[size];
  const titleColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const subtitleColor = variant === 'light' ? 'text-gray-400' : 'text-gray-400';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-200/60"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[58%] h-[58%]" aria-hidden="true">
          <path
            d="M12 3C8.5 3 6 5.5 6 9c0 2.2 1.2 4.1 3 5.2V19a1 1 0 001 1h4a1 1 0 001-1v-4.8c1.8-1.1 3-3 3-5.2 0-3.5-2.5-6-6-6z"
            fill="white"
            opacity="0.95"
          />
          <circle cx="9.5" cy="8.5" r="1" fill="#fb923c" />
          <circle cx="14.5" cy="8.5" r="1" fill="#fb923c" />
          <path d="M10 11.5c.5.5 1.2.8 2 .8s1.5-.3 2-.8" stroke="#fb923c" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-none">
        <span className={`${s.text} font-bold ${titleColor} tracking-tight block`}>
          Şirin<span className="text-orange-500"> Kids</span>
        </span>
        <span className={`text-[10px] sm:text-xs ${subtitleColor} font-medium tracking-widest uppercase hidden sm:block`}>
          Çocuk Giyim
        </span>
      </div>
    </div>
  );
}
