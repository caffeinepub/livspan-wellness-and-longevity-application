import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function StepperInput({
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  label,
  disabled = false,
  className = '',
}: StepperInputProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdDirection, setHoldDirection] = useState<'increment' | 'decrement' | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const startHold = (direction: 'increment' | 'decrement') => {
    setIsHolding(true);
    setHoldDirection(direction);
    
    // Initial action
    if (direction === 'increment') {
      increment();
    } else {
      decrement();
    }

    // Start hold timer (500ms delay before acceleration)
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        if (direction === 'increment') {
          increment();
        } else {
          decrement();
        }
      }, 100); // Accelerated repeat every 100ms
    }, 500);
  };

  const stopHold = () => {
    setIsHolding(false);
    setHoldDirection(null);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopHold();
    };
  }, []);

  const displayValue = step < 1 ? value.toFixed(1) : Math.round(value);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          onMouseDown={() => startHold('decrement')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('decrement')}
          onTouchEnd={stopHold}
          disabled={disabled || value <= min}
          className="h-10 w-10 rounded-full border-luxury-gold/30 hover:border-luxury-gold/60 hover:bg-luxury-gold/10 transition-all disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-foreground transition-all duration-200 value-change-highlight">
            {displayValue}
            {unit && <span className="text-lg ml-1 text-muted-foreground">{unit}</span>}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          onMouseDown={() => startHold('increment')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('increment')}
          onTouchEnd={stopHold}
          disabled={disabled || value >= max}
          className="h-10 w-10 rounded-full border-luxury-gold/30 hover:border-luxury-gold/60 hover:bg-luxury-gold/10 transition-all disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
