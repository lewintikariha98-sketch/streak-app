'use client';

// Flower growth stages:
// 0 = seed/soil   1 = tiny sprout   2 = seedling
// 3 = bud         4 = blooming      5 = full bloom ✨

interface FlowerPlantProps {
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  color: string;       // hex, e.g. "#7c3aed"
  lightColor: string;  // hex light, e.g. "#ede9fe"
  name: string;
  streak: number;
  xp: number;
  completedToday: boolean;
}

function Petals({ count, color, lightColor, cx, cy, outerR, innerR, rx, ry }: {
  count: number; color: string; lightColor: string;
  cx: number; cy: number; outerR: number; innerR: number; rx: number; ry: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i * 360) / count;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy - outerR + ry}
            rx={rx}
            ry={ry}
            fill={i % 2 === 0 ? color : lightColor}
            opacity={0.92}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
          />
        );
      })}
    </>
  );
}

function Sparkle({ cx, cy, size, delay }: { cx: number; cy: number; size: number; delay: string }) {
  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ animation: `sparkle 2s ${delay} ease-in-out infinite` }}>
      <line x1="0" y1={-size} x2="0" y2={size} stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={-size} y1="0" x2={size} y2="0" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={-size * 0.7} y1={-size * 0.7} x2={size * 0.7} y2={size * 0.7} stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
      <line x1={size * 0.7} y1={-size * 0.7} x2={-size * 0.7} y2={size * 0.7} stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

export default function FlowerPlant({ stage, color, lightColor, name, streak, xp, completedToday }: FlowerPlantProps) {
  const soilColor = '#92400e';
  const soilDark = '#78350f';
  const stemColor = '#16a34a';
  const leafColor = '#22c55e';
  const leafDark = '#15803d';

  const shouldSway = stage >= 2;

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      {/* Flower SVG */}
      <div className="relative">
        {/* Glow for full bloom */}
        {stage === 5 && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
            style={{ background: color }}
          />
        )}
        <svg
          viewBox="0 0 80 130"
          className="w-16 h-24 sm:w-20 sm:h-28 relative z-10"
          style={shouldSway ? { animation: `sway ${2.5 + Math.random() * 1.5}s ease-in-out infinite` } : undefined}
        >
          {/* Soil */}
          <ellipse cx="40" cy="118" rx="30" ry="10" fill={soilColor} />
          <ellipse cx="40" cy="114" rx="22" ry="7" fill={soilDark} />

          {/* Stage 0: Seed */}
          {stage === 0 && (
            <ellipse cx="40" cy="109" rx="5" ry="3.5" fill="#a3e635" opacity={0.8} />
          )}

          {/* Stage 1+: Stem */}
          {stage >= 1 && (
            <path
              d={stage === 1
                ? 'M 40 108 Q 39 98 40 86'
                : stage === 2
                ? 'M 40 108 Q 38 92 40 72'
                : 'M 40 108 Q 37 85 40 52'
              }
              stroke={stemColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Stage 1: Tiny leaves */}
          {stage === 1 && (
            <>
              <ellipse cx="34" cy="93" rx="7" ry="3.5" fill={leafColor} transform="rotate(-30, 34, 93)" />
              <ellipse cx="46" cy="91" rx="7" ry="3.5" fill={leafColor} transform="rotate(30, 46, 91)" />
            </>
          )}

          {/* Stage 2+: Larger leaves */}
          {stage >= 2 && (
            <>
              <ellipse cx="29" cy="88" rx="11" ry="5" fill={leafDark} transform="rotate(-35, 29, 88)" />
              <ellipse cx="51" cy="82" rx="11" ry="5" fill={leafColor} transform="rotate(35, 51, 82)" />
            </>
          )}

          {/* Stage 3+: Second pair of leaves */}
          {stage >= 3 && (
            <>
              <ellipse cx="31" cy="68" rx="9" ry="4" fill={leafColor} transform="rotate(-25, 31, 68)" />
              <ellipse cx="49" cy="63" rx="9" ry="4" fill={leafDark} transform="rotate(25, 49, 63)" />
            </>
          )}

          {/* Stage 3: Bud */}
          {stage === 3 && (
            <>
              <ellipse cx="40" cy="42" rx="7" ry="11" fill={lightColor} />
              <ellipse cx="40" cy="40" rx="5" ry="9" fill={color} opacity={0.7} />
              <ellipse cx="40" cy="46" rx="7" ry="5" fill={leafColor} />
            </>
          )}

          {/* Stage 4: Blooming flower (6 petals) */}
          {stage === 4 && (
            <>
              <Petals count={6} color={color} lightColor={lightColor} cx={40} cy={38} outerR={18} innerR={8} rx={6} ry={13} />
              <circle cx="40" cy="38" r="8" fill="#fbbf24" />
              <circle cx="40" cy="38" r="5" fill="#f59e0b" />
              <circle cx="40" cy="38" r="2.5" fill="#fde68a" />
            </>
          )}

          {/* Stage 5: Full bloom (8 petals + sparkles) */}
          {stage === 5 && (
            <>
              {/* Outer petal ring */}
              <Petals count={8} color={color} lightColor={lightColor} cx={40} cy={36} outerR={22} innerR={10} rx={7} ry={16} />
              {/* Inner petal ring */}
              <Petals count={8} color={lightColor} lightColor={color} cx={40} cy={36} outerR={14} innerR={8} rx={5} ry={10} />
              {/* Center */}
              <circle cx="40" cy="36" r="9" fill="#fbbf24" />
              <circle cx="40" cy="36" r="6" fill="#f59e0b" />
              <circle cx="40" cy="36" r="3" fill="#fde68a" />
              <circle cx="40" cy="36" r="1.5" fill="#fffbeb" />
              {/* Sparkles */}
              <Sparkle cx={14} cy={16} size={4} delay="0s" />
              <Sparkle cx={66} cy={20} size={3.5} delay="0.4s" />
              <Sparkle cx={10} cy={48} size={3} delay="0.8s" />
              <Sparkle cx={70} cy={50} size={4} delay="1.2s" />
              <Sparkle cx={40} cy={12} size={3} delay="0.6s" />
            </>
          )}
        </svg>
      </div>

      {/* Label */}
      <div className="text-center mt-1 px-1 max-w-[80px]">
        <p className="text-[11px] font-semibold text-gray-700 truncate">{name}</p>
        <div className="flex items-center justify-center gap-1">
          {streak > 0 && <span className="text-[10px] text-orange-500 font-medium">🔥{streak}d</span>}
          {streak === 0 && <span className="text-[10px] text-gray-400">Not started</span>}
        </div>
        <p className="text-[10px] text-violet-500 font-semibold">+{xp} XP</p>
      </div>

      {/* Completed today indicator */}
      {completedToday && (
        <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: color }} />
      )}
    </div>
  );
}
