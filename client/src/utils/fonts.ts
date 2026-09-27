export interface FontOption {
  name: string;
  family: string;
  category: "Standard" | "Design" | "Artsy" | "Display";
}

export const CATEGORIZED_FONTS: FontOption[] = [
  // Standard / Clean
  { name: "Monospace", family: "ui-monospace, monospace", category: "Standard" },
  { name: "Inter / Sans", family: "system-ui, sans-serif", category: "Standard" },
  { name: "Arial", family: "Arial, sans-serif", category: "Standard" },
  { name: "Courier", family: "'Courier New', monospace", category: "Standard" },

  // Design / Modern
  { name: "Outfit / Modern", family: "'Outfit', sans-serif", category: "Design" },
  { name: "Montserrat", family: "'Montserrat', sans-serif", category: "Design" },
  { name: "Poppins", family: "'Poppins', sans-serif", category: "Design" },
  { name: "Playfair Serif", family: "'Playfair Display', Georgia, serif", category: "Design" },

  // Artsy / Creative
  { name: "Pacifico Script", family: "'Pacifico', cursive", category: "Artsy" },
  { name: "Lobster", family: "'Lobster', cursive", category: "Artsy" },
  { name: "Caveat Handwriting", family: "'Caveat', cursive", category: "Artsy" },
  { name: "Permanent Marker", family: "'Permanent Marker', cursive", category: "Artsy" },

  // Display / Bold
  { name: "Impact", family: "Impact, sans-serif", category: "Display" },
  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Display" },
  { name: "Cinzel Classical", family: "'Cinzel', serif", category: "Display" },
  { name: "Anton Heavy", family: "'Anton', sans-serif", category: "Display" },
];
