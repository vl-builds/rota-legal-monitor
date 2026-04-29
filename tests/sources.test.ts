import { describe, it, expect } from 'bun:test'
import { sources } from '@/sources/index'

const EXPECTED_COUNTRIES = ['nl', 'pt', 'de', 'es', 'ie', 'it', 'fr', 'be', 'at', 'au']

describe('sources/index', () => {
  it('registra exatamente 10 paises', () => {
    expect(Object.keys(sources)).toHaveLength(10)
  })

  it('registra todos os paises esperados', () => {
    for (const cc of EXPECTED_COUNTRIES) {
      expect(sources).toHaveProperty(cc)
    }
  })

  it('countryCode de cada source bate com a chave do registro', () => {
    for (const [key, config] of Object.entries(sources)) {
      expect(config.countryCode).toBe(key)
    }
  })
})

describe('cada source config', () => {
  for (const [cc, config] of Object.entries(sources)) {
    describe(cc, () => {
      it('tem pelo menos 3 URLs', () => {
        expect(config.urls.length).toBeGreaterThanOrEqual(3)
      })

      it('tem no maximo 8 URLs', () => {
        expect(config.urls.length).toBeLessThanOrEqual(8)
      })

      it('todas as URLs comecam com https://', () => {
        for (const urlConfig of config.urls) {
          expect(urlConfig.url).toMatch(/^https:\/\//)
        }
      })

      it('todas as URLs tem fetchFrequency monthly', () => {
        for (const urlConfig of config.urls) {
          expect(urlConfig.fetchFrequency).toBe('monthly')
        }
      })

      it('campo model quando presente e haiku ou sonnet', () => {
        for (const urlConfig of config.urls) {
          if (urlConfig.model !== undefined) {
            expect(['haiku', 'sonnet']).toContain(urlConfig.model)
          }
        }
      })

      it('tem no maximo 1 URL com model sonnet', () => {
        const sonnetUrls = config.urls.filter((u) => u.model === 'sonnet')
        expect(sonnetUrls.length).toBeLessThanOrEqual(1)
      })

      it('tem countryName preenchido', () => {
        expect(config.countryName.length).toBeGreaterThan(0)
      })

      it('nao tem URLs duplicadas', () => {
        const urls = config.urls.map((u) => u.url)
        const unique = new Set(urls)
        expect(unique.size).toBe(urls.length)
      })
    })
  }
})

describe('distribuicao global de modelos', () => {
  it('total de URLs Sonnet e no maximo 10 (1 por pais)', () => {
    let sonnetCount = 0
    for (const config of Object.values(sources)) {
      sonnetCount += config.urls.filter((u) => u.model === 'sonnet').length
    }
    expect(sonnetCount).toBeLessThanOrEqual(10)
  })

  it('total de URLs e 50 ou menos (10 paises x 5 URLs)', () => {
    let total = 0
    for (const config of Object.values(sources)) {
      total += config.urls.length
    }
    expect(total).toBeLessThanOrEqual(50)
  })
})
