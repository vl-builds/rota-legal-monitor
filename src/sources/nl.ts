import type { SourceConfig } from '@/types'

export const nlSource: SourceConfig = {
  countryCode: 'nl',
  countryName: 'Holanda',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'nl'],

  urls: [
    {
      url: 'https://ind.nl/en/residence-permits/work',
      contentType: 'visa-overview',
      promptHint:
        'Pagina hub com todos os tipos de visto de trabalho disponiveis na Holanda. Liste cada categoria encontrada e avalie se e relevante para trabalhadores assalariados ou de plataformas (entregadores, motoristas de app).',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
      contentType: 'visa-requirements',
      promptHint:
        'Foco exclusivo no Highly Skilled Migrant visa (Kennismigrant). Extraia o valor minimo de salario bruto mensal exigido, documentos necessarios e steps do processo. Este e o campo mais critico: capture o valor exato em EUR.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year',
      contentType: 'visa-requirements',
      promptHint:
        'Visto de orientacao para recém-graduados (Orientation Year / Zoekjaar). Extraia elegibilidade, duracao maxima e se permite trabalhar durante o periodo.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://ind.nl/en/fees-costs-of-an-application',
      contentType: 'fees',
      promptHint:
        'Tabela oficial de taxas da IND para todos os vistos e permissoes de residencia. Para cada tipo, registre o valor exato em EUR. Nao estime: use apenas valores explicitamente listados.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://ind.nl/en/work',
      contentType: 'agreements',
      promptHint:
        'Pagina geral sobre trabalho na Holanda. Extraia informacoes sobre requisitos gerais (passaporte, seguro saude, registro BRP) e qualquer mencao a acordos bilaterais com paises fora da UE, incluindo o Brasil.',
      fetchFrequency: 'monthly',
    },
  ],

  verificationUrls: [
    {
      url: 'https://ind.nl/en/required-amounts',
      label: 'IND: Valores obrigatórios',
      description: 'Tabela oficial com salários mínimos para Highly Skilled Migrant (atualizada anualmente em janeiro)',
    },
    {
      url: 'https://www.government.nl/topics/working-in-the-netherlands',
      label: 'Government.nl: Trabalhar na Holanda',
      description: 'Portal oficial com salário mínimo nacional e requisitos de trabalho atualizados para 2026',
    },
    {
      url: 'https://allaboutexpats.nl',
      label: 'All About Expats NL',
      description: 'Verificação independente dos limiares salariais para o visto Highly Skilled Migrant 2026',
    },
  ],

  glossary: {
    'Highly Skilled Migrant': 'Trabalhador altamente qualificado',
    'Kennismigrant': 'Trabalhador altamente qualificado (Kennismigrant)',
    'Orientation Year': 'Ano de orientacao para recém-graduados',
    'Zoekjaar': 'Ano de orientacao para recém-graduados',
    'IND': 'Servico de Imigracao e Naturalizacao (IND)',
    'BSN': 'Numero de Servico de Cidadao (BSN)',
    'DigiD': 'Identidade digital holandesa (DigiD)',
    'BRP': 'Registro da Populacao Base (BRP)',
    'MVV': 'Visto de entrada temporaria (MVV)',
    'Zorgverzekering': 'Seguro saude basico obrigatorio',
    'Residence permit': 'Autorizacao de residencia',
    'Work permit': 'Permissao de trabalho',
    'Tewerkstellingsvergunning': 'Permissao de trabalho (TWV)',
    'Combined permit': 'Permissao combinada trabalho e residencia (GVVA)',
  },
}
