import { useEffect, useRef, useState } from 'react';

interface ChronographDialProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  size?: number;
  gradientStops: Array<{ position: number; color: string }>;
}

export default function ChronographDial({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = '',
  size = 180,
  gradientStops,
}: ChronographDialProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Get color based on value position
  const getColorForValue = (val: number): string => {
    const percentage = ((val - min) / (max - min)) * 100;
    
    for (let i = 0; i < gradientStops.length - 1; i++) {
      const current = gradientStops[i];
      const next = gradientStops[i + 1];
      
      if (percentage >= current.position && percentage <= next.position) {
        return current.color;
      }
    }
    
    return gradientStops[gradientStops.length - 1].color;
  };

  const currentColor = getColorForValue(displayValue);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw outer ring with luxury gold
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'oklch(0.75 0.15 85 / 0.3)'; // luxury gold with transparency
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw tick marks
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const startRadius = radius - 8;
      const endRadius = radius;
      
      const startX = centerX + startRadius * Math.cos(angle);
      const startY = centerY + startRadius * Math.sin(angle);
      const endX = centerX + endRadius * Math.cos(angle);
      const endY = centerY + endRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'oklch(0.5 0.03 165 / 0.5)';
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Draw value arc with gradient color
    const percentage = (displayValue - min) / (max - min);
    const endAngle = -Math.PI / 2 + percentage * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 4, -Math.PI / 2, endAngle);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw hand (pointer) with glow effect
    const handLength = radius - 15;
    const handAngle = -Math.PI / 2 + percentage * 2 * Math.PI;
    const handX = centerX + handLength * Math.cos(handAngle);
    const handY = centerY + handLength * Math.sin(handAngle);

    // Hand glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = currentColor;

    // Hand
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(handX, handY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Center dot with luxury styling
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.strokeStyle = 'oklch(0.2 0.02 165)';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [displayValue, min, max, size, currentColor]);

  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + size / 2;
    const centerY = rect.top + size / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    const percentage = angle / (2 * Math.PI);
    let newValue = min + percentage * (max - min);
    
    // Snap to step
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));
    
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleInteraction(e.clientX, e.clientY);
      };
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-pointer touch-none transition-transform hover:scale-105"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-center">
        <div className="text-3xl font-bold value-change-highlight" style={{ color: currentColor }}>
          {typeof displayValue === 'number' ? displayValue.toFixed(step < 1 ? 1 : 0) : displayValue}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}
