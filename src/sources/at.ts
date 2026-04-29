import type { SourceConfig } from '@/types'

// A Red-White-Red Card (RWR) é o sistema de pontuação austríaco com várias subcategorias.
// O LLM deve listar as subcategorias separadamente: Very Highly Qualified Workers,
// Skilled Workers in Shortage Occupations, Other Key Workers.
// Algumas categorias exigem proficiência em alemão: capturar o nível CEFR exigido.
// audienceFit: 'narrow' - mercado de delivery menor que nos países maiores.
export const atSource: SourceConfig = {
  countryCode: 'at',
  countryName: 'Austria',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'de'],

  urls: [
    {
      url: 'https://www.migration.gv.at/en/',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial de migracao da Austria. Liste os tipos de autorizacao de residencia e trabalho disponiveis para brasileiros: Red-White-Red Card (RWR), EU Blue Card, autorizacao para trabalhadores sazonais. Indique qual e o caminho mais acessivel para trabalhadores sem qualificacao europeia reconhecida.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/red-white-red-card/',
      contentType: 'visa-requirements',
      promptHint:
        'Red-White-Red Card (RWR Card) da Austria, sistema de pontuacao para trabalhadores qualificados. Para cada subcategoria (Very Highly Qualified Workers, Skilled Workers in Shortage Occupations, Other Key Workers, Self-Employed Key Workers) extraia: pontuacao minima, criterios de pontuacao, salario minimo em EUR, requisito de idioma alemao (nível CEFR) e lista de profissoes em escassez se disponivel.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.migration.gv.at/en/types-of-immigration/temporary-work/',
      contentType: 'visa-requirements',
      promptHint:
        'Portal de migracao austriaco sobre trabalho temporario. Extraia: tipos de autorizacao para trabalho temporario (Saisonnier, Rotationskraft, trabalho transfronteirico), documentos exigidos para cada tipo, prazo de validade, onde solicitar e requisitos de idioma alemao quando aplicavel.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Rot-Weiß-Rot Karte': 'Red-White-Red Card (cartao de residencia por pontos)',
    'Aufenthaltstitel': 'Autorizacao de residencia',
    'Niederlassungsbewilligung': 'Autorizacao de estabelecimento permanente',
    'AMS': 'Servico Publico de Emprego austriaco',
    'BFA': 'Escritorio Federal de Imigracao e Asilo',
    'MA 35': 'Departamento de imigracao da cidade de Viena',
    'ÖSD': 'Diploma de idioma alemao austriaco (reconhecido para visto)',
    'WKO': 'Camara Economica Federal austriaca',
    'Mangelberuf': 'Profissao em escassez na Austria',
    'Fachkraft': 'Trabalhador qualificado',
    'E-Card': 'Cartao de seguro saude austriaco',
    'SVS': 'Seguro Social para Trabalhadores Autonomos',
    'BMEIA': 'Ministerio Federal dos Negocios Estrangeiros austriaco',
    'Sprachzeugnis': 'Certificado de proficiencia em idioma',
  },
}
