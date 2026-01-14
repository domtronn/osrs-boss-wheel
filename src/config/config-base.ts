export interface WheelItem {
  name: string;
  weight: number;
  imageUrl?: string | string[]; // Single image URL or array of URLs (picks randomly)
  wikiUrl?: string; // Base wiki URL (e.g., "https://oldschool.runescape.wiki/w/Boss_Name")
}

export interface WheelConfig {
  items: WheelItem[];
  spinDuration: number; // Average spin duration in milliseconds
  spinVariance: number; // Plus/minus variance in milliseconds
}

export function normalizeConfig(config: WheelConfig): WheelConfig {
  return config;
}

export function distributeSegments(config: WheelConfig): string[] {
  const segments: string[] = [];

  // Segment count is simply the sum of all weights
  // Each item gets exactly as many segments as its weight
  config.items.forEach(item => {
    for (let i = 0; i < item.weight; i++) {
      segments.push(item.name);
    }
  });

  // Shuffle the segments for a more random appearance
  for (let i = segments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [segments[i], segments[j]] = [segments[j], segments[i]];
  }

  return segments;
}
