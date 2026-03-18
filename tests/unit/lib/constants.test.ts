import { MODELS, DEFAULT_SETTINGS, DEFAULT_SYSTEM_PROMPTS, FONT_SIZE_MAP } from '../../src/lib/constants'

describe('MODELS', () => {
  it('should contain exactly 3 Claude models', () => {
    expect(MODELS).toHaveLength(3)
  })

  it('every model should have required fields', () => {
    MODELS.forEach(m => {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('name')
      expect(m).toHaveProperty('description')
      expect(m).toHaveProperty('contextWindow')
      expect(m.contextWindow).toBeGreaterThan(0)
    })
  })

  it('should include Sonnet, Opus and Haiku', () => {
    const ids = MODELS.map(m => m.id)
    expect(ids).toContain('claude-sonnet-4-6')
    expect(ids).toContain('claude-opus-4-6')
    expect(ids).toContain('claude-haiku-4-5-20251001')
  })
})

describe('DEFAULT_SETTINGS', () => {
  it('should have a valid default model', () => {
    const ids = MODELS.map(m => m.id)
    expect(ids).toContain(DEFAULT_SETTINGS.model)
  })

  it('temperature should be between 0 and 1', () => {
    expect(DEFAULT_SETTINGS.temperature).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_SETTINGS.temperature).toBeLessThanOrEqual(1)
  })

  it('maxTokens should be a positive number', () => {
    expect(DEFAULT_SETTINGS.maxTokens).toBeGreaterThan(0)
  })

  it('streamingEnabled should be true by default', () => {
    expect(DEFAULT_SETTINGS.streamingEnabled).toBe(true)
  })

  it('theme should be "dark"', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('dark')
  })
})

describe('DEFAULT_SYSTEM_PROMPTS', () => {
  it('should have at least 3 preset prompts', () => {
    expect(DEFAULT_SYSTEM_PROMPTS.length).toBeGreaterThanOrEqual(3)
  })

  it('every prompt should have a label and value', () => {
    DEFAULT_SYSTEM_PROMPTS.forEach(p => {
      expect(p.label).toBeTruthy()
      expect(p.value).toBeTruthy()
      expect(p.value.length).toBeGreaterThan(10)
    })
  })
})

describe('FONT_SIZE_MAP', () => {
  it('should have sm, md, lg sizes', () => {
    expect(FONT_SIZE_MAP).toHaveProperty('sm')
    expect(FONT_SIZE_MAP).toHaveProperty('md')
    expect(FONT_SIZE_MAP).toHaveProperty('lg')
  })

  it('values should be CSS font-size strings', () => {
    Object.values(FONT_SIZE_MAP).forEach(v => {
      expect(v).toMatch(/^\d+px$/)
    })
  })
})
