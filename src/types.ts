export type ContentType =
  | 'visa-overview'
  | 'visa-requirements'
  | 'fees'
  | 'news'
  | 'agreements'

export interface UrlConfig {
  url: string
  contentType: ContentType
  promptHint: string
  fetchFrequency: 'monthly'
  model?: 'haiku' | 'sonnet'
  // Desativa verificacao de SSL para dominios de governo que usam CA propria
  // nao incluida no bundle do Bun/Node. Necessario para sites .gov.es, .gov.pt, etc.
  ignoreSSL?: boolean
}

export interface SourceConfig {
  countryCode: string
  countryName: string
  primaryLanguage: string
  acceptableLanguages: string[]
  urls: UrlConfig[]
  glossary: Record<string, string>
}
