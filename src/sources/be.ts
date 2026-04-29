import type { SourceConfig } from '@/types'

// A Bélgica tem competências de trabalho divididas entre o governo federal e as
// três regiões (Flandres, Valônia, Bruxelas). O monitor cobre apenas o nível federal.
// Anotar essa limitação em reliability.knownIssues ao extrair.
// Existe acordo de mobilidade jovem com o Brasil: verificar se ainda está ativo.
export const beSource: SourceConfig = {
  countryCode: 'be',
  countryName: 'Belgica',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'fr', 'nl'],

  urls: [
    {
      url: 'https://dofi.ibz.be/en',
      contentType: 'visa-overview',
      promptHint:
        'Office des Etrangers belga (Escritorio de Estrangeiros). Extraia: visao geral dos tipos de autorizacao de trabalho e residencia disponiveis para brasileiros (Single Permit, Profissional Altamente Qualificado, trabalhadores sazonais), diferenca entre autorizacao federal e regional, e como dar entrada no processo.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://employment.belgium.be/en',
      contentType: 'visa-requirements',
      promptHint:
        'Servico Federal de Emprego belga. Extraia: tipos de autorizacao de trabalho por regiao (Flandres, Valonia, Bruxelas), o Single Permit (autorizacao unica de trabalho e residencia) como caminho federal, salario minimo exigido, setores com escassez de mao de obra e se ha acordo bilateral com o Brasil.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.belgium.be/en',
      contentType: 'visa-requirements',
      promptHint:
        'Portal oficial do governo belga. Para brasileiros querendo trabalhar na Belgica, extraia: requisitos gerais de entrada (visto necessario ou nao), onde solicitar o visto de trabalho (consulado), documentos exigidos, seguro saude obrigatorio e percurso para residencia permanente apos trabalho continuado.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Single Permit': 'Autorizacao unica de trabalho e residencia',
    'Permis de travail': 'Permissao de trabalho (frances)',
    'Arbeidskaart': 'Cartao de trabalho (holandes)',
    'Titre de séjour': 'Autorizacao de residencia',
    'Verblijfstitel': 'Autorizacao de residencia (holandes)',
    'Office des Etrangers': 'Escritorio de Estrangeiros (federal)',
    'Dienst Vreemdelingenzaken': 'Servico de Estrangeiros (holandes)',
    'ONSS': 'Escritorio Nacional de Seguridade Social',
    'RSZ': 'Equivalente holandes do ONSS',
    'Carte professionnelle': 'Cartao profissional para autonomos',
    'SMIG': 'Salario minimo interprofissional garantido',
    'Flandres': 'Flandres (regiao norte, idioma holandes)',
    'Wallonie': 'Valonia (regiao sul, idioma frances)',
    'Bruxelles': 'Bruxelas (regiao capital, bilingue)',
  },
}
