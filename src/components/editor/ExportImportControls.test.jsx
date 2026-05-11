/**
 * Tests for ExportImportControls
 *
 * Environment: Vitest + jsdom
 * Run with:  npx vitest run
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

// ── Mock the playbook store ───────────────────────────────────────────────────
vi.mock('../../store/playbookStore.js', () => ({
  exportPlaybook: vi.fn(() => '{"version":1,"plays":[]}'),
  importPlaybook: vi.fn(),
}))

import { exportPlaybook, importPlaybook } from '../../store/playbookStore.js'
import ExportImportControls from './ExportImportControls.jsx'

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderComponent() {
  return render(<ExportImportControls />)
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ExportImportControls', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Export ──────────────────────────────────────────────────────────────────

  describe('Export button', () => {
    it('renders the Exporter button', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /exporter/i })).toBeDefined()
    })

    it('triggers a file download when clicked', () => {
      // Arrange
      const fakeUrl = 'blob:http://localhost/fake-url'
      const createObjectURL = vi.fn(() => fakeUrl)
      const revokeObjectURL = vi.fn()
      const clickSpy = vi.fn()

      vi.stubGlobal('URL', {
        createObjectURL,
        revokeObjectURL,
      })

      // Spy on document.createElement to intercept anchor creation
      const realCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const a = realCreateElement('a')
          vi.spyOn(a, 'click').mockImplementation(clickSpy)
          return a
        }
        return realCreateElement(tag)
      })

      renderComponent()

      // Act
      fireEvent.click(screen.getByRole('button', { name: /exporter/i }))

      // Assert — exportPlaybook was called
      expect(exportPlaybook).toHaveBeenCalledOnce()

      // Assert — a blob URL was created
      expect(createObjectURL).toHaveBeenCalledOnce()
      const blobArg = createObjectURL.mock.calls[0][0]
      expect(blobArg).toBeInstanceOf(Blob)

      // Assert — anchor was clicked (download triggered)
      expect(clickSpy).toHaveBeenCalledOnce()

      // Assert — URL was revoked to avoid memory leaks
      expect(revokeObjectURL).toHaveBeenCalledWith(fakeUrl)

      // Cleanup
      createElementSpy.mockRestore()
      vi.unstubAllGlobals()
    })

    it('sets the correct download filename on the anchor', () => {
      const fakeUrl = 'blob:http://localhost/fake-url'
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => fakeUrl),
        revokeObjectURL: vi.fn(),
      })

      let capturedAnchor = null
      const realCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const a = realCreateElement('a')
          capturedAnchor = a
          vi.spyOn(a, 'click').mockImplementation(() => {})
          return a
        }
        return realCreateElement(tag)
      })

      renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /exporter/i }))

      expect(capturedAnchor).not.toBeNull()
      expect(capturedAnchor.download).toBe('wildcats-playbook.json')
      expect(capturedAnchor.href).toContain(fakeUrl)

      createElementSpy.mockRestore()
      vi.unstubAllGlobals()
    })
  })

  // ── Import ──────────────────────────────────────────────────────────────────

  describe('Import button', () => {
    it('renders the Importer button', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /importer/i })).toBeDefined()
    })

    it('shows a confirm dialog before importing', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      renderComponent()

      const fileInput = document.querySelector('[data-testid="import-file-input"]')
      const file = new File(['{"version":1,"plays":[]}'], 'playbook.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(confirmSpy).toHaveBeenCalledOnce()
      expect(confirmSpy).toHaveBeenCalledWith(
        'Importer écrasera le livre de jeu actuel. Continuer ?'
      )

      confirmSpy.mockRestore()
    })

    it('does NOT call importPlaybook when user cancels the confirm', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      renderComponent()

      const fileInput = document.querySelector('[data-testid="import-file-input"]')
      const file = new File(['{"version":1,"plays":[]}'], 'playbook.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(importPlaybook).not.toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('calls importPlaybook with correct JSON after user confirms', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      const jsonContent = '{"version":1,"plays":[]}'

      // Mock FileReader
      const mockFileReader = {
        onload: null,
        readAsText: vi.fn(function () {
          // Simulate async file read completing
          Promise.resolve().then(() => {
            this.onload({ target: { result: jsonContent } })
          })
        }),
      }
      vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader)

      renderComponent()

      const fileInput = document.querySelector('[data-testid="import-file-input"]')
      const file = new File([jsonContent], 'playbook.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      // Wait for the async FileReader callback to complete
      await waitFor(() => {
        expect(importPlaybook).toHaveBeenCalledOnce()
      })

      expect(importPlaybook).toHaveBeenCalledWith(jsonContent)

      vi.restoreAllMocks()
    })

    it('shows a success message after a successful import', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      const jsonContent = '{"version":1,"plays":[]}'

      const mockFileReader = {
        onload: null,
        readAsText: vi.fn(function () {
          Promise.resolve().then(() => {
            this.onload({ target: { result: jsonContent } })
          })
        }),
      }
      vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader)

      renderComponent()

      const fileInput = document.querySelector('[data-testid="import-file-input"]')
      const file = new File([jsonContent], 'playbook.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeDefined()
        expect(screen.getByRole('status').textContent).toBe('Importation réussie !')
      })

      vi.restoreAllMocks()
    })
  })
})
