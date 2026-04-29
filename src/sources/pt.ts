import type { SourceConfig } from '@/types'

// vistos.mne.gov.pt tambem usa CA do governo portugues nao incluida no bundle do Bun/Node.
// ignoreSSL: true ativa tls.rejectUnauthorized=false apenas para essas requests.
export const ptSource: SourceConfig = {
  countryCode: 'pt',
  countryName: 'Portugal',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'pt'],

  urls: [
    {
      url: 'https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa',
      contentType: 'visa-overview',
      promptHint:
        'Pagina oficial do MNE portugues listando todos os tipos de visto nacional (D). Liste cada tipo: D1 (subordinado), D2 (independente), D3 (altamente qualificado), D7 (rendimentos proprios), D8 (nomade digital), CPLP. Para cada um indique o objetivo e se permite trabalhar.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/residency',
      contentType: 'visa-requirements',
      promptHint:
        'Documentos necessarios para visto de residencia para trabalho em Portugal (D1 e equivalentes). Extraia a lista completa de documentos exigidos, traducoes necessarias, apostilamentos e qualquer exigencia especifica para brasileiros (Tratado de Amizade Luso-Brasileiro e Estatuto de Igualdade).',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/cplp-en',
      contentType: 'visa-requirements',
      promptHint:
        'Documentos para o visto de mobilidade CPLP para cidadaos de paises de lingua portuguesa, incluindo brasileiros. Extraia: lista de documentos, elegibilidade especifica para brasileiros, como difere do visto D padrao, duracao e se permite trabalhar em Portugal durante o periodo de validade.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/job-seeker-visa',
      contentType: 'visa-requirements',
      promptHint:
        'Visto de busca de emprego em Portugal (job seeker visa). Extraia: documentos necessarios, duracao maxima, atividades permitidas durante a busca, e como converter para visto de trabalho apos conseguir emprego.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://vistos.mne.gov.pt/en/national-visas/general-information/fees',
      contentType: 'fees',
      promptHint:
        'Tabela oficial de taxas consulares para vistos nacionais portugueses. Extraia cada valor em EUR por tipo de visto. Registre se ha isencoes ou reducoes para brasileiros ou cidadaos CPLP. Nao estime: use apenas valores explicitamente listados.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
  ],

  glossary: {
    'Autorização de Residência': 'Autorizacao de Residencia (AR)',
    'AIMA': 'Agencia para a Integracao, Migracoes e Asilo (substitui o SEF desde 2023)',
    'MNE': 'Ministerio dos Negocios Estrangeiros',
    'NIF': 'Numero de Identificacao Fiscal',
    'CPLP': 'Comunidade dos Paises de Lingua Portuguesa',
    'Estatuto de Igualdade': 'Status especial para brasileiros com direitos equivalentes a cidadaos portugueses',
    'Tratado de Amizade': 'Tratado de Amizade, Cooperacao e Consulta Brasil-Portugal (2000)',
    'Cartao Azul UE': 'EU Blue Card para profissionais altamente qualificados',
    'D1': 'Visto de residencia para atividade profissional subordinada (empregado)',
    'D2': 'Visto de residencia para atividade profissional independente (autonomo)',
    'D3': 'Visto de residencia para profissional altamente qualificado',
    'D7': 'Visto de residencia para pessoas com rendimentos proprios',
    'D8': 'Visto de residencia para nomades digitais / trabalho remoto',
    'SNS': 'Servico Nacional de Saude portugues',
    'IEFP': 'Instituto do Emprego e Formacao Profissional',
  },
}
