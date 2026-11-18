import { useId } from 'react';

export function Logo({ size = 24 }: { size?: number }) {
  const gradientId = useId();

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 [transform:rotate3d(0,5,5,60deg)] items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin duration-3000 motion-reduce:animate-none"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(171, 0, 164)" />
            <stop offset="25%" stopColor="rgb(125, 46, 255)" />
            <stop offset="50%" stopColor="rgb(29, 99, 237)" />
            <stop offset="75%" stopColor="rgb(28, 144, 237)" />
            <stop offset="100%" stopColor="rgb(136, 213, 192)" />
          </linearGradient>
        </defs>
        <circle cx={12} cy={12} r={10} />
      </svg>
    </div>
  );
}
