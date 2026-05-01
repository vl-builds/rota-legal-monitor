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
      url: 'https://dofi.ibz.be/en/themas/onderdanen-van-derde-landen/werk/single-permit',
      contentType: 'visa-overview',
      promptHint:
        'Pagina oficial do IBZ (Escritorio de Imigracao belga) sobre o Single Permit — autorizacao unica de trabalho e residencia para nao-cidadaos da UE que querem ficar mais de 90 dias. Extraia: quem deve solicitar, como funciona o processo conjunto entre IBZ e regiao, documentos, prazo, validade e renovacao. Este e o caminho principal para brasileiros trabalharem na Belgica.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://dofi.ibz.be/en/themes/third-country-nationals/work',
      contentType: 'visa-requirements',
      promptHint:
        'Secao de trabalho do IBZ para cidadaos de paises terceiros. Extraia: todos os tipos de autorizacao de trabalho listados (Single Permit, ICT, pesquisadores, estagiarios, profissionais altamente qualificados), qual autoridade e responsavel por cada tipo e se ha exigencia de oferta de emprego.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://dofi.ibz.be/en/themes/ressortissants-dun-pays-tiers/travail/professional-card',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do IBZ sobre o cartao profissional belga (trabalho autonomo/por conta propria). Extraia: requisitos para brasileiro trabalhar como autonomo na Belgica, valor minimo de investimento ou rendimento esperado, documentos exigidos, quem emite o cartao e diferenca em relacao ao Single Permit para empregados.',
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
