import { ReactNode } from 'react';

interface EnergyCapsuleProps {
  children: ReactNode;
  completion: number; // 0-1
  accentMode?: 'gold' | 'jade';
  className?: string;
}

export default function EnergyCapsule({ 
  children, 
  completion, 
  accentMode = 'jade',
  className = '' 
}: EnergyCapsuleProps) {
  const completionPercent = Math.min(100, Math.max(0, completion * 100));
  const glowClass = completion > 0.7 ? 'energy-capsule-glow' : '';

  return (
    <div className={`energy-capsule rounded-xl relative ${glowClass} ${className}`}>
      <div 
        className="energy-fill"
        style={{ height: `${completionPercent}%` }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
