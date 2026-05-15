# Wildcats Sud — Livre de Jeu Offensif 2025

Application React + Vite pour gérer et afficher le livre de jeu offensif des Wildcats Sud. test

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

## Éditeur de jeux (accès entraîneur)

L'éditeur permet de créer et modifier des jeux directement dans le navigateur, sans toucher au code source.

### Accès

1. Connectez-vous au livre de jeu avec le mot de passe habituel.
2. Dans la barre latérale, sous **NAVIGATION**, cliquez sur **Éditeur**.
3. Un second écran de mot de passe apparaît. Entrez le mot de passe éditeur :

   ```
   wildcats-edit-2025
   ```

   La session est mémorisée dans le navigateur — vous n'aurez pas à le ressaisir tant que vous restez sur le même navigateur.

### Interface — 3 zones

```
┌─────────────┬──────────────────────────┬──────────────────┐
│  Liste des  │      Diagramme du jeu     │  Détails du jeu  │
│    jeux     │        (Canvas)           │  (Formulaire)    │
│  (240 px)   │       (flex center)       │    (320 px)      │
└─────────────┴──────────────────────────┴──────────────────┘
```

**Barre d'outils (haut)** : boutons **Exporter** et **Importer** à gauche, bouton **← Livre de Jeu** à droite.

### Liste des jeux (colonne gauche)

| Action | Comment |
|---|---|
| **Créer** | Cliquez **+ Nouveau Jeu** — un jeu vide est créé et sélectionné. |
| **Sélectionner** | Cliquez sur le nom d'un jeu. |
| **Réordonner** | Boutons **↑** et **↓** à droite de chaque rangée. |
| **Dupliquer** | Bouton **⧉** — une copie est créée et sélectionnée. |
| **Supprimer** | Bouton **×** — confirmation demandée avant suppression. |

### Formulaire (colonne droite)

| Champ | Comportement |
|---|---|
| **Nom** | Sauvegarde au clic hors du champ. |
| **Type** | Passe / Course — sauvegarde immédiate. |
| **Snap** | Down / Sur 2 — sauvegarde immédiate. |
| **Formation** | Sauvegarde au clic hors du champ. |
| **Assignations** | Éditeur de texte riche par position (QB, RB, SB, WR_L/R/M, C, LG, RG, LT, RT, TE_L/R). Sauvegarde au clic hors de l'éditeur. |

### Canvas — Édition interactive (colonne centrale)

La barre de modes au-dessus du diagramme contrôle l'interaction :

**Normal** — lecture seule.

**Déplacer joueur** — des contours blancs apparaissent autour de chaque joueur. Cliquez-glissez un joueur directement sur le diagramme pour le repositionner.

**Route (passe)** — tous les joueurs s'illuminent en orange.
1. Cliquez un joueur pour le sélectionner comme point de départ de sa route.
2. Cliquez sur le terrain pour ajouter des points de passage.
3. Cliquez **Terminer ✓** pour sauvegarder.
4. Les routes existantes s'affichent sous le diagramme avec un bouton × pour supprimer.

**Chemin de course** — dessin en deux clics.
1. Premier clic sur le terrain = point de départ du porteur (marqueur orange).
2. Deuxième clic = destination. Sauvegardé automatiquement.
3. Le chemin existant s'affiche sous le diagramme avec un bouton × pour supprimer.

**Joueurs actifs** (section en bas du canvas) — cochez/décochez chaque position pour l'afficher ou la masquer dans le diagramme.

> Toutes les modifications sont sauvegardées automatiquement dans le navigateur (localStorage). Aucun bouton "Sauvegarder" n'est nécessaire.

### Exporter / Importer

- **Exporter** : télécharge le livre de jeu complet en fichier `wildcats-playbook.json`.
- **Importer** : sélectionnez un fichier `.json` exporté précédemment. **L'import écrase toutes les données existantes** — une confirmation est demandée.

### Changer le mot de passe éditeur

Dans `src/components/EditorPasswordGate.jsx`, ligne 3 :
```js
const EDITOR_PASSWORD = 'wildcats-edit-2025'  // ← changer ici
```

---

## Changer le mot de passe (vue joueurs)

Dans `src/components/PasswordGate.jsx`, ligne 3:
```js
const CORRECT_PASSWORD = '2025'  // ← changer ici
```

## Déployer sur GitHub Pages

1. Crée un repo GitHub nommé `wildcats-ouest-playbook-2025`
2. Installe le plugin de déploiement:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Ajoute dans `package.json` sous `"scripts"`:
   ```json
   "deploy": "gh-pages -d dist"
   ```
4. Vérifie que `vite.config.js` a `base: '/wildcats-ouest-playbook-2025/'`
5. Déploie:
   ```bash
   npm run build
   npm run deploy
   ```
6. Active GitHub Pages dans les settings du repo (branch: `gh-pages`)

Ton livre de jeu sera accessible à: `https://jefffffethier.github.io/wildcats-ouest-playbook-2025/`

## Imprimer en PDF

Clique sur **Imprimer / PDF** dans la sidebar. Utilise "Enregistrer en PDF" dans la boîte de dialogue d'impression de ton navigateur. La sidebar est automatiquement cachée à l'impression.
