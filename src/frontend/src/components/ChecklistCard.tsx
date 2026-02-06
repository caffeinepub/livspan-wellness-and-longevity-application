import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  description?: string;
}

interface ChecklistCardProps {
  title: string;
  icon: string;
  items: ChecklistItem[];
  onToggle: (id: string) => void;
}

export default function ChecklistCard({ title, icon, items, onToggle }: ChecklistCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <img src={icon} alt={title} className="h-8 w-8" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => onToggle(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor={item.id}
                  className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
                {item.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
