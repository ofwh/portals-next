import { useId } from 'react';

const LOGO_PALETTES = {
  default: ['rgb(171, 0, 164)', 'rgb(125, 46, 255)', 'rgb(29, 99, 237)', 'rgb(28, 144, 237)', 'rgb(136, 213, 192)'],
  portal: ['#a45061', '#e7754b', '#ffb071', '#ffdfad', '#c07b65'],
} as const;

const PORTAL_PARTICLES = [
  [-84, 12.2, 0.4, 0.42],
  [-64, 12.7, 0.47, 0.52],
  [-55, 11.7, 0.49, 0.6],
  [-44, 13.6, 0.39, 0.53],
  [-36, 12.3, 0.65, 0.78],
  [-25, 13, 0.54, 0.73],
  [-16, 11.8, 0.55, 0.85],
  [-9, 14.2, 0.44, 0.59],
  [1, 12.8, 0.72, 0.9],
  [11, 11.7, 0.46, 0.78],
  [16, 13.8, 0.48, 0.65],
  [24, 12.5, 0.61, 0.84],
  [35, 13.9, 0.38, 0.55],
  [42, 11.9, 0.55, 0.71],
  [57, 12.7, 0.47, 0.57],
  [76, 12.2, 0.37, 0.43],
  [106, 12.5, 0.34, 0.29],
  [152, 12, 0.32, 0.24],
  [212, 12.7, 0.29, 0.2],
] as const;

export function Logo({ size = 24, variant = 'default' }: { size?: number; variant?: keyof typeof LOGO_PALETTES }) {
  const gradientId = useId();

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 [transform:rotate3d(0,5,5,60deg)] items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin overflow-visible duration-3000 motion-reduce:animate-none"
        style={{ width: '100%', height: '100%', animationDuration: variant === 'portal' ? '3s' : undefined }}
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {LOGO_PALETTES[variant].map((color, index, colors) => (
              <stop key={color} offset={index / (colors.length - 1)} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        <circle cx={12} cy={12} r={10} />
        {variant === 'portal' &&
          PORTAL_PARTICLES.map(([angle, distance, radius, opacity]) => {
            const radians = (angle * Math.PI) / 180;

            return (
              <circle
                key={angle}
                cx={12 + Math.cos(radians) * distance}
                cy={12 + Math.sin(radians) * distance}
                r={radius}
                fill={opacity > 0.65 ? LOGO_PALETTES.portal[3] : LOGO_PALETTES.portal[1]}
                opacity={opacity}
                stroke="none"
              />
            );
          })}
      </svg>
    </div>
  );
}
