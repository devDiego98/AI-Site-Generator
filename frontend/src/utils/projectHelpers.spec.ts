import { describe, expect, it } from 'vitest'
import type { Project } from '@/types/project'
import { countProjectVersions, getLatestIteration } from './projectHelpers'

describe('projectHelpers', () => {
  it('counts versions across iterations', () => {
    const project: Project = {
      id: 'p1',
      initialPrompt: 'test',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      iterations: [
        {
          id: 'i1',
          createdAt: '2026-01-01T00:00:00.000Z',
          versions: [
            {
              id: 'v1',
              instruction: 'a',
              code: 'x',
              createdAt: '2026-01-01T00:00:00.000Z',
              type: 'initial',
            },
            {
              id: 'v2',
              instruction: 'b',
              code: 'y',
              createdAt: '2026-01-01T01:00:00.000Z',
              type: 'modification',
            },
          ],
        },
      ],
    }

    expect(countProjectVersions(project)).toBe(2)
    expect(getLatestIteration(project)?.id).toBe('i1')
  })
})
