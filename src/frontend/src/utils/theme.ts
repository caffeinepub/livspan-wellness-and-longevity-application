// Shared premium gold + jade + emerald gradient theme utilities
// Replaces blue-purple palette with gold/jade/emerald/turquoise

export const luxuryGoldGradient = {
  // Primary gradient stops for UI elements
  stops: [
    { position: 0, color: 'oklch(0.65 0.18 75)' },    // dark gold
    { position: 50, color: 'oklch(0.75 0.15 85)' },   // luxury gold
    { position: 100, color: 'oklch(0.85 0.12 95)' },  // bright gold
  ],
  
  // Score visualization gradients (low to high)
  scoreGradient: [
    { position: 0, color: 'oklch(0.55 0.12 160)' },    // dark jade (low)
    { position: 50, color: 'oklch(0.65 0.14 155)' },   // jade bright (mid)
    { position: 100, color: 'oklch(0.75 0.15 85)' },   // gold (high)
  ],
  
  // Dial/slider gradients
  dialGradient: [
    { position: 0, color: 'oklch(0.55 0.12 160)' },
    { position: 50, color: 'oklch(0.60 0.15 170)' },
    { position: 100, color: 'oklch(0.75 0.15 85)' },
  ],
  
  // Glow colors
  glowPrimary: 'oklch(0.75 0.15 85 / 0.4)',
  glowSecondary: 'oklch(0.85 0.12 95 / 0.3)',
  
  // Text gradient
  textGradient: 'linear-gradient(135deg, oklch(0.85 0.12 95) 0%, oklch(0.75 0.15 85) 50%, oklch(0.65 0.18 75) 100%)',
  
  // Background gradient
  bgGradient: 'linear-gradient(135deg, oklch(0.75 0.15 85) 0%, oklch(0.85 0.12 95) 100%)',
};

// Helper to get color for a score value (0-100)
export function getScoreColor(score: number): string {
  if (score < 50) {
    // Low scores: dark jade to jade bright
    const ratio = score / 50;
    const l = 0.55 + (ratio * 0.10);
    const c = 0.12 + (ratio * 0.02);
    const h = 160 - (ratio * 5);
    return `oklch(${l} ${c} ${h})`;
  } else {
    // High scores: jade bright to gold
    const ratio = (score - 50) / 50;
    const l = 0.65 + (ratio * 0.10);
    const c = 0.14 + (ratio * 0.01);
    const h = 155 - (ratio * 70); // Transition from jade (155) to gold (85)
    return `oklch(${l} ${c} ${h})`;
  }
}

// Helper to get background gradient based on score
export function getScoreBackgroundGradient(score: number): string {
  if (score < 40) {
    return 'radial-gradient(ellipse at center, oklch(0.55 0.12 160 / 0.15) 0%, transparent 70%)';
  } else if (score < 70) {
    return 'radial-gradient(ellipse at center, oklch(0.60 0.15 170 / 0.15) 0%, transparent 70%)';
  } else {
    return 'radial-gradient(ellipse at center, oklch(0.75 0.15 85 / 0.2) 0%, transparent 70%)';
  }
}

// Helper to create CSS gradient string from gradient stops
export function createGradientString(stops: Array<{ position: number; color: string }>): string {
  return stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
}
