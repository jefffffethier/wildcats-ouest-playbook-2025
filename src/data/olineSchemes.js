// Re-export index for O-line scheme files.
// Import from here to access all concepts in one place.

export { default as DIVE_SCHEMES } from './schemes/dive.js'

export const CONCEPTS = {
  intro: '<p>Le coach va appeler quel côté on court, droite ou gauche.</p><p><b class="ol-gap-highlight">Le QB identifie le GAP sans défenseur et annonce le code à toute la ligne. </b></p><p><i>SI TOUS LES GAPS SONT PRIS ON COURT DANS LE C GAP</p></i>',
  gaps: [
    { code: 'ALPHA',   gap: 'A GAP', desc: 'Entre le Centre et le Garde' },
    { code: 'BOB',     gap: 'B GAP', desc: 'Entre le Garde et le Tackle' },
    { code: 'CHARLIE', gap: 'C GAP', desc: 'Entre le Tackle et le Wing'/*, note: 'Par défaut si tous les GAPs sont pris'*/ },
  ],
}
