import type { SourceConfig } from '@/types'

// aima.gov.pt usa CA do governo portugues nao incluida no bundle do Bun/Node.
// ignoreSSL: true ativa tls.rejectUnauthorized=false apenas para essas requests.
// vistos.mne.gov.pt bloqueia IPs do GitHub Actions (ERR_CONNECTION_CLOSED), por isso
// usamos AIMA + portaldascomunidades como fontes primarias.
export const ptSource: SourceConfig = {
  countryCode: 'pt',
  countryName: 'Portugal',
  primaryLanguage: 'pt',
  acceptableLanguages: ['pt', 'en'],

  urls: [
    {
      url: 'https://aima.gov.pt/pt/area-do-cidadao/vistos-e-autorizacoes-de-residencia',
      contentType: 'visa-overview',
      promptHint:
        'Pagina oficial da AIMA (agencia de migracao de Portugal) listando todos os tipos de visto nacional (D) e autorizacoes de residencia. Liste cada tipo: D1 (subordinado), D2 (independente), D3 (altamente qualificado), D7 (rendimentos proprios), D8 (nomade digital). Para cada um indique o objetivo e se permite trabalhar.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/area-do-cidadao/cplp',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina da AIMA sobre o acordo CPLP para cidadaos de paises de lingua portuguesa, incluindo brasileiros. Extraia: vantagens especificas para brasileiros, Estatuto de Igualdade, Tratado de Amizade Luso-Brasileiro, documentos necessarios e como difere do processo padrao de visto.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt',
      contentType: 'visa-overview',
      promptHint:
        'Pagina principal da AIMA (antiga SEF). Extraia informacoes gerais sobre requisitos de entrada e residencia em Portugal para cidadaos de fora da UE, incluindo requisitos de seguro saude, prova de meios de subsistencia e antecedentes criminais.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://www.portaldascomunidades.mne.gov.pt/pt/vistos-e-legalizacao',
      contentType: 'visa-requirements',
      promptHint:
        'Portal do Ministerio dos Negocios Estrangeiros portugues sobre vistos e legalizacao. Extraia: tipos de visto nacional disponíveis, documentos exigidos, taxas em EUR, prazos de processamento e informacoes especificas para brasileiros (Tratado de Amizade, Estatuto de Igualdade).',
      fetchFrequency: 'monthly',
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
