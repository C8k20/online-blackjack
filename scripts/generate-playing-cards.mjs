import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "cards");

const suits = [
  { id: "C", label: "♣", color: "#1a1a1a" },
  { id: "D", label: "♦", color: "#c41e3a" },
  { id: "H", label: "♥", color: "#c41e3a" },
  { id: "S", label: "♠", color: "#1a1a1a" },
];

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function svgFor(cardId, rank, suit) {
  const displayRank = rank === "A" ? "A" : rank;
  const sym = suit.label;
  const col = suit.color;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="196" viewBox="0 0 140 196">
  <rect width="140" height="196" rx="10" ry="10" fill="#fafafa" stroke="#ccc" stroke-width="2"/>
  <text x="18" y="36" font-size="28" font-family="Georgia,serif" fill="${col}" font-weight="700">${displayRank}</text>
  <text x="18" y="62" font-size="26" font-family="Georgia,serif" fill="${col}">${sym}</text>
  <text x="70" y="118" font-size="56" text-anchor="middle" font-family="Georgia,serif" fill="${col}">${sym}</text>
  <text x="122" y="178" font-size="28" font-family="Georgia,serif" fill="${col}" font-weight="700" text-anchor="end">${displayRank}</text>
  <text x="122" y="152" font-size="26" font-family="Georgia,serif" fill="${col}" text-anchor="end">${sym}</text>
</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const suit of suits) {
  for (const rank of ranks) {
    const id = `${rank}${suit.id}`;
    const file = path.join(outDir, `${id}.svg`);
    fs.writeFileSync(file, svgFor(id, rank, suit), "utf8");
  }
}

console.log("Wrote 52 cards to", outDir);
