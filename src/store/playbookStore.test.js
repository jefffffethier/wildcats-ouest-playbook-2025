/**
 * playbookStore.test.js
 * Vitest unit tests for the Playbook Store.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import seedPlays from '../data/plays.js'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
// jsdom provides a working localStorage, but we reset it before each test so
// every test starts from a clean slate.

function freshLocalStorage() {
  let store = {}
  return {
    getItem: vi.fn(key => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
}

// We stub localStorage globally before importing the module so the module
// picks up our mock on first load.
const localStorageMock = freshLocalStorage()
vi.stubGlobal('localStorage', localStorageMock)

// Now import the store. Because Vitest caches modules, we use the
// _resetForTests() escape hatch to reinitialise state between tests.
import {
  getPlays,
  getPlay,
  addPlay,
  updatePlay,
  deletePlay,
  duplicatePlay,
  reorderPlays,
  exportPlaybook,
  importPlaybook,
  subscribe,
  _resetForTests,
} from './playbookStore.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Re-seed localStorage to empty and re-initialise the store. */
function resetStore(initialJson) {
  localStorageMock.clear()
  if (initialJson !== undefined) {
    localStorageMock.setItem('wc_playbook', initialJson)
  }
  _resetForTests()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('playbookStore', () => {
  beforeEach(() => {
    resetStore() // empty localStorage → seeds from plays.js
  })

  // -------------------------------------------------------------------------
  // getPlays — seed
  // -------------------------------------------------------------------------
  describe('getPlays()', () => {
    it('returns the seeded plays on first load when localStorage is empty', () => {
      const plays = getPlays()
      expect(plays).toHaveLength(seedPlays.length)
      expect(plays[0].name).toBe(seedPlays[0].name)
    })

    it('returns a copy — mutations do not affect internal state', () => {
      const plays = getPlays()
      plays.push({ id: 'fake', name: 'Fake' })
      expect(getPlays()).toHaveLength(seedPlays.length)
    })
  })

  // -------------------------------------------------------------------------
  // getPlay
  // -------------------------------------------------------------------------
  describe('getPlay(id)', () => {
    it('returns the play matching the given id', () => {
      const plays = getPlays()
      const target = plays[0]
      expect(getPlay(target.id)).toMatchObject({ id: target.id, name: target.name })
    })

    it('returns undefined for an unknown id', () => {
      expect(getPlay('does-not-exist')).toBeUndefined()
    })
  })

  // -------------------------------------------------------------------------
  // addPlay
  // -------------------------------------------------------------------------
  describe('addPlay(play)', () => {
    it('returns the new play with a generated id', () => {
      const before = getPlays().length
      const newPlay = addPlay({
        name: 'Test Play',
        formation: 'Shotgun',
        type: 'pass',
        description: 'A test play',
        snap: 'shotgun',
        positions: { QB: { x: 50, y: 70 } },
        assignments: [],
      })
      expect(newPlay.id).toBeDefined()
      expect(typeof newPlay.id).toBe('string')
      expect(newPlay.name).toBe('Test Play')
      expect(getPlays()).toHaveLength(before + 1)
    })

    it('persists to localStorage', () => {
      addPlay({ name: 'Persisted', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      const raw = localStorageMock.getItem('wc_playbook')
      const parsed = JSON.parse(raw)
      expect(parsed.some(p => p.name === 'Persisted')).toBe(true)
    })

    it('generates unique ids for each new play', () => {
      const a = addPlay({ name: 'A', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      const b = addPlay({ name: 'B', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      expect(a.id).not.toBe(b.id)
    })
  })

  // -------------------------------------------------------------------------
  // updatePlay
  // -------------------------------------------------------------------------
  describe('updatePlay(id, patch)', () => {
    it('applies the patch and returns the updated play', () => {
      const original = getPlays()[0]
      const updated = updatePlay(original.id, { name: 'Updated Name' })
      expect(updated.name).toBe('Updated Name')
      expect(updated.id).toBe(original.id)
      // Other fields unchanged
      expect(updated.formation).toBe(original.formation)
    })

    it('returns undefined for an unknown id', () => {
      expect(updatePlay('ghost-id', { name: 'X' })).toBeUndefined()
    })

    it('persists the patch to localStorage', () => {
      const play = getPlays()[0]
      updatePlay(play.id, { description: 'New description' })
      const raw = localStorageMock.getItem('wc_playbook')
      const parsed = JSON.parse(raw)
      const saved = parsed.find(p => p.id === play.id)
      expect(saved.description).toBe('New description')
    })

    it('does not allow the patch to change the id', () => {
      const play = getPlays()[0]
      const updated = updatePlay(play.id, { id: 'hacked-id', name: 'Hacked' })
      expect(updated.id).toBe(play.id)
    })
  })

  // -------------------------------------------------------------------------
  // deletePlay
  // -------------------------------------------------------------------------
  describe('deletePlay(id)', () => {
    it('removes the play from the store', () => {
      const plays = getPlays()
      const target = plays[0]
      deletePlay(target.id)
      expect(getPlays()).toHaveLength(plays.length - 1)
      expect(getPlay(target.id)).toBeUndefined()
    })

    it('persists the deletion to localStorage', () => {
      const target = getPlays()[0]
      deletePlay(target.id)
      const raw = localStorageMock.getItem('wc_playbook')
      const parsed = JSON.parse(raw)
      expect(parsed.find(p => p.id === target.id)).toBeUndefined()
    })

    it('is a no-op for an unknown id', () => {
      const before = getPlays().length
      deletePlay('nobody')
      expect(getPlays()).toHaveLength(before)
    })
  })

  // -------------------------------------------------------------------------
  // duplicatePlay
  // -------------------------------------------------------------------------
  describe('duplicatePlay(id)', () => {
    it('creates a new play with a different id', () => {
      const original = getPlays()[0]
      const copy = duplicatePlay(original.id)
      expect(copy).toBeDefined()
      expect(copy.id).not.toBe(original.id)
      expect(copy.name).toBe(original.name)
    })

    it('appends the duplicate to the end of the list', () => {
      const original = getPlays()[0]
      const copy = duplicatePlay(original.id)
      const plays = getPlays()
      expect(plays[plays.length - 1].id).toBe(copy.id)
    })

    it('returns undefined for an unknown id', () => {
      expect(duplicatePlay('ghost')).toBeUndefined()
    })

    it('does not alter the original play', () => {
      const original = getPlays()[0]
      duplicatePlay(original.id)
      expect(getPlay(original.id)).toMatchObject({ id: original.id })
    })
  })

  // -------------------------------------------------------------------------
  // reorderPlays
  // -------------------------------------------------------------------------
  describe('reorderPlays(ids)', () => {
    it('reorders plays to match the provided id array', () => {
      const before = getPlays()
      // Reverse the order
      const reversed = [...before].reverse().map(p => p.id)
      reorderPlays(reversed)
      const after = getPlays()
      expect(after.map(p => p.id)).toEqual(reversed)
    })

    it('persists the new order to localStorage', () => {
      const before = getPlays()
      const reversed = [...before].reverse().map(p => p.id)
      reorderPlays(reversed)
      const raw = localStorageMock.getItem('wc_playbook')
      const parsed = JSON.parse(raw)
      expect(parsed.map(p => p.id)).toEqual(reversed)
    })

    it('drops plays whose ids are not in the provided array', () => {
      const plays = getPlays()
      // Keep only first two
      reorderPlays([plays[0].id, plays[1].id])
      expect(getPlays()).toHaveLength(2)
    })
  })

  // -------------------------------------------------------------------------
  // exportPlaybook / importPlaybook — round-trip
  // -------------------------------------------------------------------------
  describe('exportPlaybook() + importPlaybook()', () => {
    it('round-trips: export then import restores identical plays', () => {
      // Mutate the store a bit first
      addPlay({ name: 'Export Test', formation: 'Pistol', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      const exported = exportPlaybook()

      // Wipe and re-seed
      resetStore()
      expect(getPlays()).toHaveLength(seedPlays.length) // back to seed

      // Import the exported snapshot
      importPlaybook(exported)
      const restored = getPlays()
      const original = JSON.parse(exported)
      expect(restored).toHaveLength(original.length)
      expect(restored.map(p => p.id)).toEqual(original.map(p => p.id))
    })

    it('exportPlaybook returns valid JSON', () => {
      const json = exportPlaybook()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('importPlaybook throws if json is not an array', () => {
      expect(() => importPlaybook(JSON.stringify({ not: 'an array' }))).toThrow(TypeError)
    })

    it('importPlaybook overwrites the store', () => {
      const snapshot = exportPlaybook()
      addPlay({ name: 'Extra', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      importPlaybook(snapshot)
      expect(getPlays()).toHaveLength(JSON.parse(snapshot).length)
    })
  })

  // -------------------------------------------------------------------------
  // subscribe
  // -------------------------------------------------------------------------
  describe('subscribe(fn)', () => {
    it('calls the listener with the full plays array on addPlay', () => {
      const listener = vi.fn()
      subscribe(listener)
      addPlay({ name: 'Sub Test', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      expect(listener).toHaveBeenCalledOnce()
      expect(Array.isArray(listener.mock.calls[0][0])).toBe(true)
    })

    it('calls the listener on updatePlay', () => {
      const listener = vi.fn()
      subscribe(listener)
      const play = getPlays()[0]
      updatePlay(play.id, { name: 'Updated' })
      expect(listener).toHaveBeenCalledOnce()
    })

    it('calls the listener on deletePlay', () => {
      const listener = vi.fn()
      subscribe(listener)
      deletePlay(getPlays()[0].id)
      expect(listener).toHaveBeenCalledOnce()
    })

    it('calls the listener on importPlaybook', () => {
      const listener = vi.fn()
      subscribe(listener)
      importPlaybook(exportPlaybook())
      expect(listener).toHaveBeenCalledOnce()
    })

    it('unsubscribe stops future notifications', () => {
      const listener = vi.fn()
      const unsub = subscribe(listener)
      unsub()
      addPlay({ name: 'After Unsub', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      expect(listener).not.toHaveBeenCalled()
    })

    it('supports multiple simultaneous subscribers', () => {
      const a = vi.fn()
      const b = vi.fn()
      subscribe(a)
      subscribe(b)
      addPlay({ name: 'Multi', formation: 'I', type: 'run', description: '', snap: 'down', positions: {}, assignments: [] })
      expect(a).toHaveBeenCalledOnce()
      expect(b).toHaveBeenCalledOnce()
    })
  })
})
