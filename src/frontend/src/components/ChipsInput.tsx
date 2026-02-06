import { Button } from '@/components/ui/button';

interface ChipsInputProps {
  presets: Array<{ label: string; value: number }>;
  onSelect: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function ChipsInput({
  presets,
  onSelect,
  disabled = false,
  className = '',
}: ChipsInputProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {presets.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(preset.value)}
          disabled={disabled}
          className="h-8 px-3 rounded-full border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-xs font-medium transition-all"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
