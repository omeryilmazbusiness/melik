'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const PLACEHOLDER = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export default function CountdownBanner() {
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);

  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(PLACEHOLDER);

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(target));
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const display = mounted ? time : PLACEHOLDER;

  const units = [
    { value: display.days, label: 'Gün' },
    { value: display.hours, label: 'Saat' },
    { value: display.minutes, label: 'Dakika' },
    { value: display.seconds, label: 'Saniye' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl border-2 border-orange-400 bg-orange-50/30">
        <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Kampanyanın bitmesine
        </p>

        <div className="flex items-center gap-3 sm:gap-4" suppressHydrationWarning>
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 sm:gap-4">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                  {pad(unit.value)}
                </span>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{unit.label}</p>
              </div>
              {i < units.length - 1 && (
                <span className="text-xl font-light text-gray-300 -mt-4">:</span>
              )}
            </div>
          ))}
        </div>

        <a
          href="#section-firsat_urunler"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Zap size={16} />
          Ürünler İçin Tıklayın
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
