import { useEffect, useRef, useState } from 'react';
import { luxuryGoldGradient, createGradientString } from '../utils/theme';

interface ChronographDialProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  size?: number;
  qualityLabels?: string[];
}

export default function ChronographDial({
  value,
  onChange,
  min = 0,
  max = 24,
  step = 0.5,
  label = '',
  unit = 'h',
  size = 200,
  qualityLabels,
}: ChronographDialProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);

  const valueToAngle = (val: number): number => {
    const range = max - min;
    const normalizedValue = (val - min) / range;
    return normalizedValue * 360 - 90;
  };

  const angleToValue = (angle: number): number => {
    let normalizedAngle = (angle + 90) % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    const range = max - min;
    const rawValue = (normalizedAngle / 360) * range + min;
    return Math.round(rawValue / step) * step;
  };

  const getAngleFromEvent = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): number => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  useEffect(() => {
    setCurrentAngle(valueToAngle(value));
  }, [value, min, max]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Outer ring with luxury gold gradient
    const outerGradient = ctx.createLinearGradient(0, 0, size, size);
    outerGradient.addColorStop(0, 'oklch(0.55 0.12 160)');
    outerGradient.addColorStop(0.5, 'oklch(0.65 0.14 155)');
    outerGradient.addColorStop(1, 'oklch(0.75 0.15 85)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = outerGradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Tick marks
    const tickCount = qualityLabels ? qualityLabels.length : Math.ceil((max - min) / step);
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
      const tickLength = i % 2 === 0 ? 10 : 6;
      const startRadius = radius - tickLength;
      const endRadius = radius;

      const startX = centerX + startRadius * Math.cos(angle);
      const startY = centerY + startRadius * Math.sin(angle);
      const endX = centerX + endRadius * Math.cos(angle);
      const endY = centerY + endRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'oklch(0.75 0.15 85 / 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Progress arc with jade-to-gold gradient
    const progressGradient = ctx.createLinearGradient(0, 0, size, size);
    progressGradient.addColorStop(0, 'oklch(0.55 0.12 160)');
    progressGradient.addColorStop(0.5, 'oklch(0.65 0.14 155)');
    progressGradient.addColorStop(1, 'oklch(0.75 0.15 85)');

    const startAngle = -Math.PI / 2;
    const endAngle = (currentAngle * Math.PI) / 180;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 6, startAngle, endAngle);
    ctx.strokeStyle = progressGradient;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = 'oklch(0.75 0.15 85 / 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 6, startAngle, endAngle);
    ctx.strokeStyle = progressGradient;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pointer
    const pointerAngle = (currentAngle * Math.PI) / 180;
    const pointerLength = radius - 15;
    const pointerX = centerX + pointerLength * Math.cos(pointerAngle);
    const pointerY = centerY + pointerLength * Math.sin(pointerAngle);

    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'oklch(0.75 0.15 85)';
    ctx.fill();
    ctx.strokeStyle = 'oklch(0.85 0.12 95)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'oklch(0.75 0.15 85)';
    ctx.fill();
  }, [currentAngle, size, min, max, step, qualityLabels]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
    const angle = getAngleFromEvent(nativeEvent, canvas);
    const newValue = angleToValue(angle);
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const angle = getAngleFromEvent(e, canvas);
      const newValue = angleToValue(angle);
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, min, max, step, onChange]);

  const getQualityLabel = () => {
    if (!qualityLabels) return null;
    const index = Math.round((value / max) * (qualityLabels.length - 1));
    return qualityLabels[Math.max(0, Math.min(qualityLabels.length - 1, index))];
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <div className="text-sm font-medium text-jade-bright">
          {label}
        </div>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className="cursor-pointer touch-none"
          style={{ width: size, height: size }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold luxury-text-gold">
            {value.toFixed(step < 1 ? 1 : 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {unit}
          </div>
          {getQualityLabel() && (
            <div className="text-xs text-jade-bright mt-1 font-medium">
              {getQualityLabel()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
