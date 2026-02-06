import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-luxury-gold/20 glass-panel backdrop-blur">
      <div className="container flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © 2026. Built with <Heart className="inline h-4 w-4 fill-luxury-gold text-luxury-gold" /> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="font-medium text-luxury-gold hover:underline">
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
