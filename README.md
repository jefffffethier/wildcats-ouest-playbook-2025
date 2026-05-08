# Wildcats Sud — Livre de Jeu Offensif 2025

Application React + Vite pour gérer et afficher le livre de jeu offensif des Wildcats Sud.

## Démarrage rapide

```bash
npm install
npm run dev
```

## Structure du projet

```
src/
  App.jsx                  # Composant racine, gestion de l'authentification
  index.css                # Variables CSS globales (couleurs, polices)
  components/
    PasswordGate.jsx       # Écran de mot de passe
    PlayDiagram.jsx        # Diagramme SVG du jeu
    PlayCard.jsx           # Carte d'un jeu (diagramme + assignations)
  data/
    plays.js               # ← ÉDITER ICI pour ajouter/modifier des jeux
  pages/
    PlaybookPage.jsx       # Page principale avec filtre et liste
```

## Ajouter un nouveau jeu

Ouvre `src/data/plays.js` et ajoute un objet au tableau. Voici la structure:

```js
{
  id: "dt-nom-unique",           // identifiant unique
  name: "Nom du Jeu",            // nom affiché
  formation: "Double Tight",     // formation (utilisé pour filtrer)
  type: "run",                   // "run" ou "pass"
  description: "Description courte du jeu.",
  snap: "down",                  // "down" (normal) ou "sur2" (sur 2)

  // Positions des joueurs (x, y en % du terrain, 0=gauche/haut, 100=droite/bas)
  positions: {
    QB:   { x: 50, y: 62 },
    RB:   { x: 50, y: 75 },
    C:    { x: 50, y: 52 },
    LG:   { x: 43, y: 52 },
    RG:   { x: 57, y: 52 },
    LT:   { x: 36, y: 52 },
    RT:   { x: 64, y: 52 },
    TE_L: { x: 30, y: 52 },
    TE_R: { x: 70, y: 52 },
    SB:   { x: 22, y: 58 },
    WR_L: { x: 10, y: 52 },
    WR_R: { x: 90, y: 52 },
  },

  // Mouvements (optionnel)
  // type: "pre-snap" (flèche jaune pointillée) ou "motion" (flèche jaune solide)
  motions: [
    { player: "SB", from: { x: 22, y: 58 }, to: { x: 38, y: 52 }, type: "motion" },
  ],

  // Pour jeux de course: chemin du porteur
  runPath: { from: { x: 50, y: 75 }, to: { x: 38, y: 42 } },

  // Pour jeux de passe: tracés des receveurs
  routes: [
    { player: "WR_R", path: [{ x: 90, y: 52 }, { x: 90, y: 30 }], label: "GO" },
  ],

  // Assignations textuelles (liste de strings)
  assignments: [
    "LT — Bloque 1 contre 1",
    "RB — Course vers le B Gap",
  ]
}
```

## Changer le mot de passe

Dans `src/components/PasswordGate.jsx`, ligne 3:
```js
const CORRECT_PASSWORD = 'wildcats2025'  // ← changer ici
```

## Déployer sur GitHub Pages

1. Crée un repo GitHub nommé `wildcats-playbook`
2. Installe le plugin de déploiement:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Ajoute dans `package.json` sous `"scripts"`:
   ```json
   "deploy": "gh-pages -d dist"
   ```
4. Vérifie que `vite.config.js` a `base: '/wildcats-playbook/'`
5. Déploie:
   ```bash
   npm run build
   npm run deploy
   ```
6. Active GitHub Pages dans les settings du repo (branch: `gh-pages`)

Ton livre de jeu sera accessible à: `https://[ton-username].github.io/wildcats-playbook/`

## Imprimer en PDF

Clique sur **Imprimer / PDF** dans la sidebar. Utilise "Enregistrer en PDF" dans la boîte de dialogue d'impression de ton navigateur. La sidebar est automatiquement cachée à l'impression.
