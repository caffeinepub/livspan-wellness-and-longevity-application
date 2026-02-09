import { useEffect, useRef } from 'react';
import { getScoreColor } from '../utils/theme';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export default function ScoreRing({
  score,
  maxScore = 100,
  size = 200,
  strokeWidth = 12,
  label = 'Score',
  showValue = true,
  className = '',
}: ScoreRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentage = Math.min(100, (score / maxScore) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'oklch(0.2 0 0 / 0.3)';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw score arc with gold gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, 'oklch(0.55 0.12 160)');
    gradient.addColorStop(0.5, 'oklch(0.65 0.14 155)');
    gradient.addColorStop(1, 'oklch(0.75 0.15 85)');

    ctx.beginPath();
    ctx.arc(
      size / 2,
      size / 2,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI * percentage) / 100
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [score, maxScore, size, strokeWidth, percentage, radius, circumference, offset]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Rotating spark ring */}
      <div className="spark-ring" style={{ width: size + 20, height: size + 20 }} />
      
      {/* Portal pulse container */}
      <div className="portal-ring-pulse relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="portal-ring-glow"
        />
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <>
              <div className="text-4xl font-bold luxury-text-gold">
                {Math.round(score)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {label}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
