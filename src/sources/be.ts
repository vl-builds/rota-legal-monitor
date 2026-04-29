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
      url: 'https://dofi.ibz.be/en/themes/work',
      contentType: 'visa-overview',
      promptHint:
        'Office des Etrangers belga, secao sobre trabalho para estrangeiros. Liste os tipos de autorizacao de trabalho disponiveis para brasileiros (Single Permit, Profissional Altamente Qualificado, Seasonal Worker). Indique para cada tipo se e autorizacao unica (residencia + trabalho) ou separada.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://diplomatie.belgium.be/en/services/travel-to-belgium/visa-for-belgium',
      contentType: 'visa-requirements',
      promptHint:
        'Ministerio das Relacoes Exteriores belga sobre vistos para a Belgica. Para brasileiros, extraia: se precisam de visto para entrar (verificar lista de paises isentos vs obrigados), tipos de visto de trabalho disponíveis, documentos necessarios e onde solicitar o visto.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://emploi.belgique.be/en/themes/foreign-workers',
      contentType: 'visa-requirements',
      promptHint:
        'Ministerio do Emprego belga sobre trabalhadores estrangeiros. Extraia: tipos de autorizacao de trabalho por regiao (Flandres, Valonia, Bruxelas), o Single Permit (autorizacao unica) como caminho federal, salario minimo exigido, setores com falta de mao de obra e se ha acordo bilateral com o Brasil. Indicar que a Belgica tem competencias regionais de trabalho.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
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
