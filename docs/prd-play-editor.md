## Problem Statement

Coaches currently define plays by hand-editing JavaScript source files (`src/data/plays.js`). This is error-prone, requires a development environment, and makes it impossible for a non-technical coach to add or modify plays. There is no way to back up or share the playbook without touching source code.

## Solution

A password-protected editor route (`/editor`) built into the existing app that lets a coach visually design plays on a canvas, edit all play metadata and assignments with a rich text interface, and export/import the full playbook as a JSON file. Play data moves from hardcoded source files into localStorage, seeded from the existing plays on first load, so the viewer and editor share a single live data source.

## User Stories

1. As a coach, I want to access a dedicated editor page at `/editor`, so that I can manage plays separately from the player-facing playbook.
2. As a coach, I want the editor to be protected by its own password, so that players cannot accidentally modify the playbook.
3. As a coach, I want the four existing plays to be available in the editor on first launch, so that I do not have to re-enter them from scratch.
4. As a coach, I want my edits to persist between sessions without any manual save step, so that I never lose work when I close the browser.
5. As a coach, I want to see a list of all plays in the editor sidebar, so that I can navigate between plays quickly.
6. As a coach, I want to create a new play from scratch, so that I can add new offensive schemes to the playbook.
7. As a coach, I want to delete a play, so that I can remove schemes that are no longer in use.
8. As a coach, I want to duplicate an existing play, so that I can use it as a starting point for a variation.
9. As a coach, I want to drag a player token onto the canvas to set their starting position, so that I can establish the formation visually.
10. As a coach, I want to drag a player already on the canvas to reposition them, so that I can adjust the formation without re-entering coordinates.
11. As a coach, I want to select from a fixed list of Canadian football position labels (QB, RB, FB, C, LG, RG, LT, RT, TE_L, TE_R, SB, WR_L, WR_R, WR_M, and others) when placing a player, so that position labels stay consistent across all plays.
12. As a coach, I want to place exactly 12 players on the canvas per play (matching Canadian football rules), so that the diagram reflects a legal formation.
13. As a coach, I want to remove a player from the canvas, so that I can adjust the formation to a different personnel grouping.
14. As a coach, I want to draw a run path by clicking waypoints on the canvas, so that I can define the ball carrier's intended path visually.
15. As a coach, I want to draw a pass route for any eligible receiver by clicking waypoints, so that I can define their route visually.
16. As a coach, I want to draw a QB path (e.g. bootleg) by clicking waypoints, so that I can show post-snap QB movement.
17. As a coach, I want to draw a pre-snap motion arrow for any player by clicking waypoints, so that I can show motion assignments.
18. As a coach, I want to mark a motion arrow as either "pre-snap" or "motion" type, so that the diagram renders it with the correct visual style (dashed vs. solid).
19. As a coach, I want to double-click to finish drawing a waypoint path, so that I have a clear gesture to complete a route.
20. As a coach, I want to delete any drawn path or motion arrow, so that I can correct mistakes without starting over.
21. As a coach, I want to click a player on the canvas to open an inline note field, so that I can enter their blocking assignment directly.
22. As a coach, I want the canvas to update in real time as I make changes, so that I can see the impact of every edit immediately.
23. As a coach, I want to edit the play's name, formation, description, type (run/pass), and snap type (down/sur2) in a form panel alongside the canvas, so that all metadata is editable in one place.
24. As a coach, I want to edit the assignments list using a rich text editor that supports bold, italic, and bullet lists, so that I can format tactical instructions clearly.
25. As a coach, I want to export the entire playbook as a single `wildcats-playbook.json` file, so that I have a portable backup.
26. As a coach, I want to import a `wildcats-playbook.json` file to replace the current playbook, so that I can restore a backup or adopt a playbook from another device.
27. As a coach, I want a confirmation prompt before importing, so that I do not accidentally overwrite unsaved work.
28. As a coach, I want to reorder plays in the list via drag-and-drop, so that I can control the order they appear in the playbook viewer.
29. As a coach, I want the playbook viewer to read from the same localStorage data as the editor, so that edits are reflected immediately in the viewer without a rebuild.

## Implementation Decisions

### Modules

**1. Playbook Store**
Central data layer. Initialises localStorage from `plays.js` seed data if no stored playbook exists. Exposes a simple CRUD interface: list plays, get play by id, create play, update play, delete play, reorder plays, import full playbook, export full playbook. All other modules read and write through this interface — nothing touches localStorage directly.

**2. Editor Auth**
Separate password gate for the `/editor` route, independent of the existing player-facing `PasswordGate`. Stores auth state in its own localStorage key so the editor session persists separately.

**3. App Router**
Extend the existing top-level routing in `App.jsx` to add the `/editor` route (hash-based, consistent with the current single-page setup). The viewer and editor are mutually exclusive views; both boot from the same Playbook Store.

**4. Play Canvas**
SVG-based interactive canvas built on top of the existing `PlayDiagram` rendering logic. Adds:
- Draggable player tokens (mousedown + mousemove + mouseup)
- Waypoint path drawing mode: click to place points, double-click to commit, Escape to cancel
- Path type selector (run path, pass route, QB path, pre-snap motion, motion)
- Inline block-note popover on player click
- Delete handles on players and paths
- Canvas reads from and writes to Playbook Store on every interaction (autosave)

**5. Play Form Panel**
A side panel rendered alongside the canvas. Contains:
- Text inputs for name, formation, description
- Select inputs for type (run/pass) and snap (down/sur2)
- Tiptap-powered rich text editor (StarterKit extension: bold, italic, bullet list) for the assignments field
- Writes to Playbook Store on change (debounced)

**6. Play List Sidebar**
Left sidebar in the editor showing all plays. Supports create, duplicate, delete, and reorder (drag-and-drop). Clicking a play loads it into the canvas and form panel.

**7. Export / Import Controls**
Toolbar buttons in the editor header:
- Export: serialises the Playbook Store to JSON and triggers a browser file download
- Import: opens a file picker, parses the JSON, shows a confirmation dialog, then calls Playbook Store import

### Schema
Play objects retain their current shape exactly. No schema migration needed — the seed is `plays.js` as-is. The localStorage key is `wc_playbook` (array of play objects). A second key `wc_editor_auth` tracks editor session state.

### Routing
Hash-based: `/#/` = viewer (existing), `/#/editor` = editor. No server-side routing changes needed for GitHub Pages.

### Rich Text Storage
Assignments are stored as Tiptap/ProseMirror JSON in localStorage and rendered as HTML in the viewer, replacing the current plain-string array.

## Testing Decisions

**What makes a good test here:** test observable behaviour through the public interface of each module, not internal implementation. For the Playbook Store: call the CRUD methods and assert the resulting state. For Export/Import: assert that a round-trip produces identical data. Do not test SVG rendering internals or React component state directly.

**Modules to test:**
- **Playbook Store** — unit tests: seed behaviour (empty localStorage → 4 plays), CRUD operations, reorder, export/import round-trip, import confirmation guard.
- **Export/Import** — integration test: export a known playbook, import the file, assert the store matches the original.

**Prior art:** no existing tests in the codebase. These would be the first. Use Vitest (already available via Vite) with plain unit tests — no DOM needed for the store module.

## Out of Scope

- O-line scheme editor (deferred — plays editor ships first)
- Per-play export/import (noted as future option; only full-playbook JSON in this version)
- Multi-user / multi-device sync (single coach, single device)
- Real-time collaboration or conflict resolution
- Custom position label creation (fixed master list only)
- Route presets / named route library
- Undo/redo history
- Mobile / touch support for the canvas

## Further Notes

- The existing `PlayDiagram` SVG rendering component should be refactored into a shared rendering core used by both the read-only viewer and the interactive canvas editor, to avoid duplication.
- Per-play export/import is explicitly deferred but should be kept in mind when designing the JSON schema — a single play object is already a valid self-contained unit.
- Canadian football: 12 players on the field. The position master list must reflect Canadian-specific roles.
- The editor password should be stored as a separate env var or config constant, distinct from the player-facing password.
