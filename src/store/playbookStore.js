/**
 * playbookStore.js — Playbook Store Contract
 *
 * getPlays()                         → Play[]
 * getPlay(id: string)                → Play | undefined
 * addPlay(play: Omit<Play, 'id'>)    → Play   (generates id internally)
 * updatePlay(id, patch)              → Play | undefined
 * deletePlay(id: string)             → void
 * duplicatePlay(id: string)          → Play | undefined  (new id, appended to end)
 * reorderPlays(ids: string[])        → void  (ids = full ordered array of all play ids)
 * exportPlaybook()                   → string  (JSON string)
 * importPlaybook(json: string)       → void  (overwrites store, triggers listeners)
 * subscribe(fn: (plays: Play[]) => void) → () => void  (returns unsubscribe fn)
 *
 * Play shape mirrors src/data/plays.js:
 * {
 *   id: string,
 *   name: string,
 *   formation: string,
 *   type: 'run' | 'pass',
 *   description: string,
 *   snap: string,
 *   positions: { [player: string]: { x: number, y: number } },
 *   motions?: Array<{ player: string, path: {x,y}[], type: string }>,
 *   ballCarrier?: string,
 *   runPath?: { from: {x,y}, to: {x,y} },
 *   qbPath?: { from: {x,y}, to: {x,y}, type: string },
 *   blocks?: Array<{ player: string, note: string }>,
 *   routes?: Array<{ player: string, path: {x,y}[], label: string }>,
 *   passProtection?: string[],
 *   assignments: { [positionKey: string]: string },
 *   slug?: string,
 * }
 *
 * localStorage key: wc_playbook
 */

import seedPlays from '../data/plays.js'

const STORAGE_KEY = 'wc_playbook'

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** @type {Array<import('../data/plays.js').default[0]>} */
let _plays = []

/** @type {Set<(plays: any[]) => void>} */
const _listeners = new Set()

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function _load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        _plays = parsed
        return
      }
    }
  } catch (_) {
    // corrupted storage — fall through to seed
  }
  // Seed from static data, ensuring every play has an id
  _plays = seedPlays.map(play =>
    play.id ? { ...play } : { ...play, id: _generateId() }
  )
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_plays))
  } catch (_) {
    // storage full or unavailable — silently ignore
  }
}

function _notify() {
  const snapshot = [..._plays]
  for (const fn of _listeners) {
    fn(snapshot)
  }
}

function _generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for environments that lack crypto.randomUUID (should not happen in Node 18+)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

// Initialise on module load
_load()

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return a shallow copy of the current plays array. */
export function getPlays() {
  return [..._plays]
}

/** Return the play with the given id, or undefined. */
export function getPlay(id) {
  return _plays.find(p => p.id === id)
}

/**
 * Add a new play. Generates a fresh id.
 * @param {Object} play  Play object without an id field.
 * @returns {Object} The persisted play (with id).
 */
export function addPlay(play) {
  const newPlay = { ...play, id: _generateId() }
  _plays = [..._plays, newPlay]
  _persist()
  _notify()
  return newPlay
}

/**
 * Patch an existing play.
 * @returns {Object|undefined} Updated play, or undefined if not found.
 */
export function updatePlay(id, patch) {
  let updated
  _plays = _plays.map(p => {
    if (p.id === id) {
      updated = { ...p, ...patch, id }
      return updated
    }
    return p
  })
  if (!updated) return undefined
  _persist()
  _notify()
  return updated
}

/**
 * Remove a play by id.
 */
export function deletePlay(id) {
  _plays = _plays.filter(p => p.id !== id)
  _persist()
  _notify()
}

/**
 * Duplicate a play, assigning a new id. Appends to end of list.
 * @returns {Object|undefined} The new play, or undefined if the source play was not found.
 */
export function duplicatePlay(id) {
  const source = _plays.find(p => p.id === id)
  if (!source) return undefined
  const copy = { ...source, id: _generateId() }
  _plays = [..._plays, copy]
  _persist()
  _notify()
  return copy
}

/**
 * Reorder plays. `ids` must be a permutation of all current play ids.
 * Plays whose ids are not present in `ids` are dropped silently.
 */
export function reorderPlays(ids) {
  const map = new Map(_plays.map(p => [p.id, p]))
  _plays = ids.map(id => map.get(id)).filter(Boolean)
  _persist()
  _notify()
}

/** Serialize the entire playbook to a JSON string.
 *  If a play has a `slug` field, it is used as the exported `id`. */
export function exportPlaybook() {
  return JSON.stringify(_plays.map(({ slug, ...p }) =>
    slug ? { ...p, id: slug } : p
  ))
}

/**
 * Overwrite the store from a JSON string.
 * Throws if `json` is not a valid JSON array.
 */
export function importPlaybook(json) {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) {
    throw new TypeError('importPlaybook: JSON must be an array of plays')
  }
  _plays = parsed
  _persist()
  _notify()
}

/**
 * Subscribe to store changes.
 * @param {(plays: any[]) => void} fn  Called with the full plays array on every mutation.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

/**
 * Reset internal state — used only in tests.
 * Clears in-memory state and re-loads from localStorage (or seed if empty).
 * @internal
 */
export function _resetForTests() {
  _plays = []
  _listeners.clear()
  _load()
}
