import { ReactNode } from 'react';

interface EnergyCapsuleProps {
  children: ReactNode;
  completion: number; // 0-1
  accentMode?: 'gold' | 'jade' | 'emerald';
  className?: string;
}

export default function EnergyCapsule({ 
  children, 
  completion, 
  accentMode = 'jade',
  className = '' 
}: EnergyCapsuleProps) {
  const completionPercent = Math.min(100, Math.max(0, completion * 100));
  const isHighCompletion = completion > 0.7;
  
  const modeClass = accentMode === 'gold' ? '' : accentMode === 'jade' ? 'jade-mode' : 'emerald-mode';
  const completionAttr = isHighCompletion ? 'high' : 'low';

  return (
    <div 
      className={`energy-capsule ${modeClass} ${className}`}
      style={{ '--fill-height': `${completionPercent}%` } as React.CSSProperties}
      data-completion={completionAttr}
    >
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}
