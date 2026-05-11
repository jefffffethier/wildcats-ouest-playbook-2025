// O-line blocking schemes — Dive : Courses à l'intérieur (Gauche)
//
// Coordinate space: 500 × 190 SVG viewport
// O-line y = 145, D-line y ≈ 78, LB level y ≈ 38, FB y = 162
//
// Fixed O-line positions:
//   LW(75,145)  LT(150,145)  LG(210,145)  C(270,145)  RG(330,145)  RT(390,145)  RW(455,145)
//
// Left-side gap centres:
//   C-gap ≈ x=112   B-gap ≈ x=180   A-gap ≈ x=240

export const CONCEPTS = {
  intro: 'Le QB identifie le GAP sans défenseur et annonce le code à toute la ligne.',
  gaps: [
    { code: 'ALPHA',   gap: 'A GAP', desc: 'Entre le Centre et le Garde' },
    { code: 'BOB',     gap: 'B GAP', desc: 'Entre le Garde et le Tackle' },
    { code: 'CHARLIE', gap: 'C GAP', desc: 'Entre le Tackle et le Wing', note: 'Par défaut si tous les GAPs sont pris' },
  ],
}

export const DIVE_LEFT_SCHEMES = {
  normal: [
    {
      id: 'alpha',
      code: 'Alpha',
      gap: 'A GAP',
      defenders: [
        { x: 65,  y: 78 },   // left edge DE
        { x: 175, y: 76 },   // left B-gap DT  (LG blocks this)
        { x: 308, y: 73 },   // right A-gap DT (C + RG double-team)
        { x: 370, y: 78 },   // right DT
        { x: 192, y: 36 },   // left LB
        { x: 330, y: 36 },   // right LB
      ],
      blocks: [
        { from: [75,  145], to: [65,  78] },           // LW → edge
        { from: [210, 145], to: [175, 76] },           // LG → B-gap DT (left)
        { from: [270, 145], to: [308, 73] },           // C  → right A-gap DT (double)
        { from: [330, 145], to: [308, 73] },           // RG → double-team with C
      ],
      releases: [
        { from: [270, 145], to: [192, 36] },           // C releases to left LB
      ],
      runX: 240,
      assignments: [
        { player: 'Centre',     text: "Si DT dans A gap côté opposé : double team avec RG, puis 2e niveau" },
        { player: 'G à Gauche', text: 'Block le DT à ta gauche' },
        { player: 'W',          text: "Block le premier joueur à l'extérieur" },
      ],
    },
    {
      id: 'bob',
      code: 'BOB',
      gap: 'B GAP',
      defenders: [
        { x: 65,  y: 78 },   // left edge DE
        { x: 120, y: 78 },   // 5-tech outside LT (LT blocks this, to LT's left)
        { x: 238, y: 74 },   // left A-gap DT  (LG + C double-team)
        { x: 308, y: 73 },   // right A-gap DT
        { x: 370, y: 78 },   // right DT
        { x: 178, y: 36 },   // left LB (over B-gap)
        { x: 330, y: 36 },   // right LB
      ],
      blocks: [
        { from: [75,  145], to: [65,  78] },           // LW → edge
        { from: [150, 145], to: [120, 78] },           // LT → 5-tech (to LT's left)
        { from: [210, 145], to: [238, 74] },           // LG → A-gap DT (double)
        { from: [270, 145], to: [238, 74] },           // C  → double-team with LG
      ],
      releases: [
        { from: [210, 145], to: [178, 36] },           // LG releases to left LB
      ],
      runX: 180,
      assignments: [
        { player: 'Garde',       text: "Si DT dans A gap côté du jeu : double team avec C, puis 2e niveau" },
        { player: 'T à Gauche',  text: 'Block le DT à ta gauche' },
        { player: 'W',           text: "Block le premier joueur à l'extérieur" },
      ],
    },
    {
      id: 'charlie',
      code: 'Charlie',
      gap: 'C GAP',
      defenders: [
        { x: 42,  y: 82 },   // far-left edge (outside LW)
        { x: 175, y: 76 },   // B-gap DT  (LT blocks this, to LT's right)
        { x: 238, y: 74 },   // left A-gap DT (LG + C double-team)
        { x: 308, y: 73 },   // right A-gap DT
        { x: 370, y: 78 },   // right DT
        { x: 148, y: 36 },   // left LB
        { x: 330, y: 36 },   // right LB
      ],
      blocks: [
        { from: [75,  145], to: [42,  82] },           // LW → outside edge
        { from: [150, 145], to: [175, 76] },           // LT → B-gap DT (to LT's right)
        { from: [210, 145], to: [238, 74] },           // LG → A-gap DT (double)
        { from: [270, 145], to: [238, 74] },           // C  → double-team with LG
      ],
      releases: [
        { from: [210, 145], to: [148, 36] },           // LG releases to left LB
      ],
      runX: 112,
      assignments: [
        { player: 'Garde',       text: "Si DT dans A gap côté du jeu : double team avec C, puis 2e niveau" },
        { player: 'T à Gauche',  text: 'Block le DT à ta droite' },
        { player: 'W',           text: "Block le premier joueur à l'extérieur" },
      ],
    },
  ],

  blitz: [
    {
      id: 'alpha-blitz',
      code: 'Alpha',
      gap: 'A GAP',
      defenders: [
        { x: 65,  y: 78 },
        { x: 175, y: 76 },
        { x: 308, y: 73 },
        { x: 370, y: 78 },
        { x: 192, y: 36 },
        { x: 330, y: 36 },
      ],
      blocks: [
        { from: [75,  145], to: [65,  78] },
        { from: [210, 145], to: [175, 76] },
        { from: [270, 145], to: [308, 73] },
        { from: [330, 145], to: [308, 73] },
      ],
      runX: 240,
      blitzer:  { x: 192, y: 36,  toX: 240, toY: 128 },
      fb:       { x: 240, y: 162 },
      fbBlock:  { toX: 218, toY: 90 },
      assignments: [
        { player: 'Centre',     text: "Double team DT côté opposé avec RG — FB gère le blitz" },
        { player: 'G à Gauche', text: 'Block le DT à ta gauche' },
        { player: 'FB',         text: 'Block le blitz dans le A Gap' },
        { player: 'W',          text: "Block le premier joueur à l'extérieur" },
      ],
    },
    {
      id: 'bob-blitz',
      code: 'BOB',
      gap: 'B GAP',
      defenders: [
        { x: 65,  y: 78 },
        { x: 120, y: 78 },
        { x: 238, y: 74 },
        { x: 308, y: 73 },
        { x: 370, y: 78 },
        { x: 178, y: 36 },
        { x: 330, y: 36 },
      ],
      blocks: [
        { from: [75,  145], to: [65,  78] },
        { from: [150, 145], to: [120, 78] },
        { from: [210, 145], to: [238, 74] },
        { from: [270, 145], to: [238, 74] },
      ],
      runX: 180,
      blitzer:  { x: 178, y: 36,  toX: 180, toY: 128 },
      fb:       { x: 180, y: 162 },
      fbBlock:  { toX: 178, toY: 90 },
      assignments: [
        { player: 'Garde',      text: "Double team DT A gap avec C — FB gère le blitz" },
        { player: 'T à Gauche', text: 'Block le DT à ta gauche' },
        { player: 'FB',         text: 'Block le blitz dans le B Gap' },
        { player: 'W',          text: "Block le premier joueur à l'extérieur" },
      ],
    },
    {
      id: 'charlie-blitz',
      code: 'Charlie',
      gap: 'C GAP',
      defenders: [
        { x: 42,  y: 82 },
        { x: 175, y: 76 },
        { x: 238, y: 74 },
        { x: 308, y: 73 },
        { x: 370, y: 78 },
        { x: 148, y: 36 },
        { x: 330, y: 36 },
      ],
      blocks: [
        { from: [75,  145], to: [42,  82] },
        { from: [150, 145], to: [175, 76] },
        { from: [210, 145], to: [238, 74] },
        { from: [270, 145], to: [238, 74] },
      ],
      runX: 112,
      blitzer:  { x: 148, y: 36,  toX: 112, toY: 128 },
      fb:       { x: 112, y: 162 },
      fbBlock:  { toX: 128, toY: 90 },
      assignments: [
        { player: 'Garde',      text: "Double team DT A gap avec C, puis 2e niveau" },
        { player: 'T à Gauche', text: 'Block le DT à ta droite' },
        { player: 'FB',         text: 'Block le blitz dans le C Gap' },
        { player: 'W',          text: "Block le premier joueur à l'extérieur" },
      ],
    },
  ],
}
