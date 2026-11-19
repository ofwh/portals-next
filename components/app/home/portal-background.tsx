'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/shared/classnames';

const TURN = Math.PI * 2;
const TILT = -0.23;
const DISK_FLATTENING = 0.29;
const DISK_ROTATION_SECONDS = 42;
const HALO_ROTATION_SECONDS = 60;
const DISK_EXTENT = 4.9;
const DISK_BAND_COUNT = 38;
const DISK_BAND_SEGMENTS = 24;
const DISK_WISP_COUNT = 360;
const HALO_EXTENT = 1.7;
const DISK_COLORS = ['#fec48b', '#f3a25a', '#ffe9c9', '#e7754e', '#8b89b4', '#565981'] as const;

type Scene = {
  width: number;
  height: number;
  radius: number;
};

type Fragment = {
  angle: number;
  distance: number;
  height: number;
  spin: number;
  size: number;
  life: number;
  age: number;
  color: string;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createFragment(): Fragment {
  return {
    angle: random(0, TURN),
    distance: random(2.8, 5.8),
    height: random(-2.9, 2.9),
    spin: random(1.45, 3.8),
    size: random(0.8, 4.5),
    life: random(4.3, 9),
    age: random(-5, -0.3),
    color: DISK_COLORS[Math.floor(random(0, DISK_COLORS.length))],
  };
}

function drawAtmosphere(context: CanvasRenderingContext2D, { width, height, radius }: Scene, dark: boolean) {
  if (dark) {
    const x = width / 2;
    const y = height * 0.51;
    const sky = context.createRadialGradient(x, y, radius * 0.4, x, y, Math.max(width, height) * 0.55);

    sky.addColorStop(0, '#654653');
    sky.addColorStop(0.2, '#30253d');
    sky.addColorStop(0.56, '#111a30');
    sky.addColorStop(1, '#080a14');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
  }

  const stars = dark ? ['#eab586', '#bfdbff'] : ['#bd8262', '#a89db8'];

  for (let index = 0; index < 550; index++) {
    const size = random(0.3, index % 17 === 0 ? 1.65 : 0.9);

    context.fillStyle = stars[index % 5 === 0 ? 0 : 1];
    context.globalAlpha = random(0.12, dark ? 0.78 : 0.45);
    context.beginPath();
    context.arc(random(0, width), random(0, height), size, 0, TURN);
    context.fill();
  }

  context.globalAlpha = 1;
}

function shadeRing(context: CanvasRenderingContext2D, extent: number, shade: CanvasGradient) {
  context.save();
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = shade;
  context.fillRect(-extent, -extent, extent * 2, extent * 2);
  context.restore();
}

function drawDiskWisps(context: CanvasRenderingContext2D, radius: number) {
  for (let index = 0; index < DISK_WISP_COUNT; index++) {
    const spread = Math.pow(Math.random(), 1.6);
    const distance = radius * (1.17 + 2.7 * spread);
    const start = random(0, TURN);
    const length = random(0.1, 0.43);
    const middle = start + length / 2;
    const end = start + length;
    const bend = radius * random(-0.055, 0.07);
    const x = Math.cos(start) * distance;
    const y = Math.sin(start) * distance;
    const endX = Math.cos(end) * (distance + bend);
    const endY = Math.sin(end) * (distance + bend);
    const controlDistance = distance / Math.cos(length / 2) + bend * 1.4;
    const glow = context.createLinearGradient(x, y, endX, endY);
    const alpha = Math.pow(1 - spread, 1.4) * random(0.32, 0.82);
    const width = radius * random(0.021, 0.075);

    glow.addColorStop(0, 'transparent');
    glow.addColorStop(0.42, spread < 0.48 ? '#ffc186' : '#ed845d');
    glow.addColorStop(0.72, '#ffb08088');
    glow.addColorStop(1, 'transparent');
    context.strokeStyle = glow;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(Math.cos(middle) * controlDistance, Math.sin(middle) * controlDistance, endX, endY);
    context.lineWidth = width * 2.25;
    context.globalAlpha = alpha * 0.26;
    context.stroke();
    context.lineWidth = width;
    context.globalAlpha = alpha * 0.68;
    context.stroke();
  }
}

function drawDisk(context: CanvasRenderingContext2D, radius: number) {
  const glow = context.createRadialGradient(0, 0, radius * 0.9, 0, 0, radius * 4.4);
  const segmentAngle = TURN / DISK_BAND_SEGMENTS;

  glow.addColorStop(0, 'transparent');
  glow.addColorStop(0.035, '#ee8b3e2a');
  glow.addColorStop(0.078, '#ffdfada8');
  glow.addColorStop(0.12, '#ffd19cd9');
  glow.addColorStop(0.2, '#ffa8718f');
  glow.addColorStop(0.34, '#e7754b5c');
  glow.addColorStop(0.59, '#a450612f');
  glow.addColorStop(1, 'transparent');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(0, 0, radius * 4.4, 0, TURN);
  context.fill();

  context.save();
  context.globalCompositeOperation = 'screen';
  drawDiskWisps(context, radius);

  for (let index = 0; index < DISK_BAND_COUNT; index++) {
    const progress = (index + random(0.08, 0.5)) / DISK_BAND_COUNT;
    const offset = 0.14 * progress + 0.86 * Math.pow(progress, 2.25);
    const distance = radius * (1.12 + offset * 3.55);
    const intensity = Math.pow(1 - offset, 1.55);
    const width = radius * (0.012 + offset * 0.047) * random(0.72, 1.2);
    const hue = 38 - 57 * progress;
    const phase = random(0, TURN);
    const centerX = radius * random(-0.014, 0.014);
    const centerY = radius * random(-0.014, 0.014);

    context.strokeStyle = `hsl(${hue} 92% 66%)`;
    context.globalAlpha = intensity * random(0.1, 0.21);
    context.lineWidth = width * 2.6;
    context.beginPath();
    context.arc(centerX, centerY, distance, 0, TURN);
    context.stroke();

    for (let segment = 0; segment < DISK_BAND_SEGMENTS; segment++) {
      const angle = phase + segment * segmentAngle;
      const length = segmentAngle * random(0.55, 1.12) * (1 - offset * 0.36);

      context.strokeStyle = `hsl(${hue + random(-8, 8)} 94% ${random(65, 87)}%)`;
      context.globalAlpha = intensity * random(0.14, 0.64);
      context.lineWidth = width * random(0.25, 0.77);
      context.beginPath();
      context.arc(centerX, centerY, distance, angle, angle + length);
      context.stroke();
    }
  }

  context.restore();

  const extent = radius * DISK_EXTENT;
  const shade = context.createLinearGradient(-extent, -radius, extent, radius);

  shade.addColorStop(0, '#ffffff44');
  shade.addColorStop(0.35, '#ffffff66');
  shade.addColorStop(0.66, 'white');
  shade.addColorStop(1, '#ffffffb3');
  shadeRing(context, extent, shade);
}

function drawHalo(context: CanvasRenderingContext2D, radius: number) {
  const halo = context.createRadialGradient(0, 0, radius * 0.84, 0, 0, radius * 1.65);

  halo.addColorStop(0, 'transparent');
  halo.addColorStop(0.23, '#ffd99cbd');
  halo.addColorStop(0.39, '#e9835777');
  halo.addColorStop(0.74, '#b6516127');
  halo.addColorStop(1, 'transparent');
  context.fillStyle = halo;
  context.fillRect(-radius * HALO_EXTENT, -radius * HALO_EXTENT, radius * HALO_EXTENT * 2, radius * HALO_EXTENT * 2);

  for (let index = 0; index < 630; index++) {
    const distance = radius * (1.02 + Math.pow(Math.random(), 2) * 0.48);
    const angle = random(0, TURN);

    context.globalAlpha = random(0.06, 0.33) * (1.55 - distance / radius);
    context.strokeStyle = DISK_COLORS[index % DISK_COLORS.length];
    context.lineWidth = random(0.3, 2);
    context.beginPath();
    context.ellipse(0, radius * 0.03, distance, distance * 1.04, 0, angle, angle + random(0.03, 0.65));
    context.stroke();
  }

  context.globalAlpha = 1;
  context.strokeStyle = '#ffe1b4';
  context.lineWidth = Math.max(1, radius * 0.016);
  context.shadowColor = '#f3a766';
  context.shadowBlur = radius * 0.1;
  context.beginPath();
  context.arc(0, 0, radius, 0, TURN);
  context.stroke();
  context.shadowBlur = 0;

  const shade = context.createConicGradient(-Math.PI / 2, 0, 0);

  shade.addColorStop(0, '#ffffffbf');
  shade.addColorStop(0.16, '#ffffff');
  shade.addColorStop(0.39, '#ffffff61');
  shade.addColorStop(0.52, '#ffffff83');
  shade.addColorStop(0.71, '#ffffffe6');
  shade.addColorStop(0.88, '#ffffff69');
  shade.addColorStop(1, '#ffffffbf');
  shadeRing(context, radius * HALO_EXTENT, shade);

  const core = context.createRadialGradient(0, 0, radius * 0.42, 0, 0, radius);

  core.addColorStop(0, '#030409');
  core.addColorStop(0.86, '#070812');
  core.addColorStop(1, '#19101a');
  context.fillStyle = core;
  context.beginPath();
  context.arc(0, 0, Math.max(radius * 0.5, radius - context.lineWidth / 2), 0, TURN);
  context.fill();
}

function drawRotatingRing(
  context: CanvasRenderingContext2D,
  texture: HTMLCanvasElement,
  extent: number,
  angle: number,
  flattening = 1,
) {
  context.save();
  context.scale(1, flattening);
  context.rotate(angle);
  context.drawImage(texture, -extent, -extent, extent * 2, extent * 2);
  context.restore();
}

function fragmentPosition(fragment: Fragment, progress: number, radius: number) {
  const remaining = 1 - Math.pow(progress, 1.5);
  const distance = radius * (0.72 + fragment.distance * remaining);
  const angle = fragment.angle + fragment.spin * Math.pow(progress, 1.8);
  const height = radius * fragment.height * remaining;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.55 + height,
  };
}

function drawFragment(context: CanvasRenderingContext2D, fragment: Fragment, radius: number) {
  const progress = fragment.age / fragment.life;

  if (progress <= 0 || progress >= 1) {
    return;
  }

  const head = fragmentPosition(fragment, progress, radius);
  const distance = Math.hypot(head.x, head.y);

  if (distance <= radius) {
    fragment.age = fragment.life;

    return;
  }

  const opacity = Math.min(1, progress * 8, (distance / radius - 1) * 4);
  const size = fragment.size * (1 - progress * 0.66) * Math.min(1, radius / 105);
  const trail = Math.min(progress, 0.17);

  context.strokeStyle = fragment.color;
  context.lineCap = 'round';
  for (let segment = 0; segment < 7; segment++) {
    const from = fragmentPosition(fragment, progress - (trail * segment) / 7, radius);
    const to = fragmentPosition(fragment, progress - (trail * (segment + 1)) / 7, radius);

    if (Math.hypot(to.x, to.y) <= radius) {
      break;
    }

    context.globalAlpha = opacity * (1 - segment / 7) * 0.65;
    context.lineWidth = Math.max(0.4, size * (1 - segment / 7));
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  context.save();
  context.translate(head.x, head.y);
  context.rotate(fragment.angle + progress * 7);
  context.globalAlpha = opacity;
  context.fillStyle = fragment.color;
  context.shadowColor = fragment.color;
  context.shadowBlur = 8;
  context.beginPath();
  context.moveTo(-size, 0);
  context.lineTo(size * 0.25, -size * 0.75);
  context.lineTo(size, -size * 0.12);
  context.lineTo(size * 0.48, size * 0.68);
  context.closePath();
  context.fill();
  context.restore();
}

export function PortalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const backdrop = document.createElement('canvas');
    const backdropContext = backdrop.getContext('2d');
    const disk = document.createElement('canvas');
    const diskContext = disk.getContext('2d');
    const halo = document.createElement('canvas');
    const haloContext = halo.getContext('2d');

    if (!backdropContext || !diskContext || !haloContext) {
      return;
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let dark = root.classList.contains('dark');
    let scene: Scene = { width: 0, height: 0, radius: 0 };
    let frame = 0;
    let previous = 0;
    let time = 0;
    let visible = false;
    const dust = Array.from({ length: 110 }, () => ({
      angle: random(0, TURN),
      distance: random(1.2, 3.8),
      size: random(0.35, 1.2),
      opacity: random(0.15, 0.7),
      speed: random(0.22, 0.56),
    }));
    const fragments = Array.from({ length: 34 }, (_, index) => {
      const fragment = createFragment();

      if (index < 24) {
        fragment.age = fragment.life * random(0.18, 0.74);
      }

      return fragment;
    });

    function paint() {
      if (!context || !scene.radius) {
        return;
      }

      const { width, height, radius } = scene;

      const diskAngle = ((time % DISK_ROTATION_SECONDS) / DISK_ROTATION_SECONDS) * TURN;
      const haloAngle = ((time % HALO_ROTATION_SECONDS) / HALO_ROTATION_SECONDS) * TURN;

      if (!dark) {
        context.clearRect(0, 0, width, height);
      }

      context.drawImage(backdrop, 0, 0, width, height);
      context.save();
      context.translate(width / 2, height * 0.51);
      context.rotate(TILT);
      drawRotatingRing(context, disk, radius * DISK_EXTENT, diskAngle, DISK_FLATTENING);
      drawRotatingRing(context, halo, radius * HALO_EXTENT, haloAngle);

      context.save();
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI);
      context.closePath();
      context.clip();
      drawRotatingRing(context, disk, radius * DISK_EXTENT, diskAngle, DISK_FLATTENING);
      context.restore();

      if (motion.matches) {
        context.restore();

        return;
      }

      context.fillStyle = '#ffddad';
      for (const grain of dust) {
        const angle = grain.angle + (time * grain.speed) / grain.distance;
        const distance = grain.distance * radius;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance * DISK_FLATTENING;

        if (y < 0 && x * x + y * y < radius * radius) {
          continue;
        }

        context.globalAlpha = grain.opacity * (0.55 + 0.45 * Math.sin(angle + time * 0.8));
        context.fillRect(x, y, grain.size * 1.5, grain.size);
      }

      fragments.forEach((fragment) => drawFragment(context, fragment, radius));
      context.restore();
    }

    function tick(now: number) {
      const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 0;

      previous = now;
      time += elapsed;
      fragments.forEach((fragment, index) => {
        fragment.age += elapsed;
        if (fragment.age >= fragment.life) {
          fragments[index] = createFragment();
        }
      });
      paint();
      frame = requestAnimationFrame(tick);
    }

    function updatePlayback() {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      frame = 0;
      previous = 0;
      if (visible && !document.hidden && !motion.matches && scene.radius) {
        frame = requestAnimationFrame(tick);
      }
    }

    const drawBackdrop = () => {
      backdropContext.clearRect(0, 0, scene.width, scene.height);
      drawAtmosphere(backdropContext, scene, dark);
    };

    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      if (!width || !height) {
        return;
      }

      const resolution = Math.min(window.devicePixelRatio || 1, 1.5);

      scene = { width, height, radius: Math.min(width * 0.173, height * 0.21) };
      canvas.width = backdrop.width = Math.round(width * resolution);
      canvas.height = backdrop.height = Math.round(height * resolution);
      context.setTransform(resolution, 0, 0, resolution, 0, 0);
      backdropContext.setTransform(resolution, 0, 0, resolution, 0, 0);
      const diskExtent = scene.radius * DISK_EXTENT;
      const haloExtent = scene.radius * HALO_EXTENT;

      disk.width = disk.height = Math.ceil(diskExtent * 2);
      halo.width = halo.height = Math.ceil(haloExtent * resolution * 2);
      diskContext.translate(disk.width / 2, disk.height / 2);
      diskContext.scale(disk.width / (diskExtent * 2), disk.height / (diskExtent * 2));
      haloContext.translate(halo.width / 2, halo.height / 2);
      haloContext.scale(halo.width / (haloExtent * 2), halo.height / (haloExtent * 2));
      drawDisk(diskContext, scene.radius);
      drawHalo(haloContext, scene.radius);
      drawBackdrop();

      paint();
      updatePlayback();
    });

    resize.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });

    intersection.observe(canvas);

    const theme = new MutationObserver(() => {
      const nextDark = root.classList.contains('dark');

      if (dark !== nextDark) {
        dark = nextDark;
        if (scene.radius) {
          drawBackdrop();
          paint();
        }
      }
    });

    theme.observe(root, { attributeFilter: ['class'] });

    const onMotionChange = () => {
      paint();
      updatePlayback();
    };

    motion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', updatePlayback);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      motion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', updatePlayback);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-88 md:inset-y-0 md:left-[max(32%,calc(50%-15rem))] md:h-auto',
        'dark:[background-image:radial-gradient(circle_closest-side_at_center_51%,#080914_0%,#080914_33%,#af693f_34%,#241c33_36%,transparent_97%)]',
        '[mask-image:radial-gradient(ellipse_at_center,black_32%,transparent_73%)] md:[mask-image:radial-gradient(ellipse_at_52%_51%,black_33%,transparent_71%)]',
      )}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
