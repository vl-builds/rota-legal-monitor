import type { SourceConfig } from '@/types'

// aima.gov.pt usa CA do governo portugues nao incluida no bundle do Bun/Node.
// ignoreSSL: true ativa tls.rejectUnauthorized=false apenas para essas requests.
// vistos.mne.gov.pt e portaldascomunidades.mne.gov.pt bloqueiam IPs do GitHub Actions.
export const ptSource: SourceConfig = {
  countryCode: 'pt',
  countryName: 'Portugal',
  primaryLanguage: 'pt',
  acceptableLanguages: ['pt', 'en'],

  urls: [
    {
      url: 'https://aima.gov.pt/pt/trabalhar',
      contentType: 'visa-overview',
      promptHint:
        'Pagina hub da AIMA listando todos os tipos de autorizacao de residencia para trabalho em Portugal para cidadaos de fora da UE. Liste cada tipo disponivel: subordinado (empregado), independente (autonomo), altamente qualificado, nomade digital, transferencia intraempresarial. Indique para cada um se exige visto previo ou se ha dispensa.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-visto-de-residencia-art-88-o-n-o-1',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade profissional subordinada (empregado) com visto de residencia em Portugal. Extraia: documentos exigidos, contrato de trabalho necessario, salario minimo, prazo de processamento e se ha tratamento especial para cidadaos brasileiros (Estatuto de Igualdade, Tratado de Amizade Luso-Brasileiro).',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-dispensa-de-visto-de-residencia-art-88-o-n-o-',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade subordinada COM DISPENSA de visto de residencia em Portugal. Esta modalidade e relevante para brasileiros cobertos pelo Estatuto de Igualdade e Tratado de Amizade Luso-Brasileiro. Extraia: quem e elegivel para a dispensa, documentos necessarios e como o processo difere da via com visto.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-atividade-altamente-qualificada-art-90-o',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade altamente qualificada em Portugal (equivalente ao EU Blue Card). Extraia: salario bruto minimo anual em EUR, qualificacao academica exigida, documentos necessarios e como se compara ao processo padrao de trabalho.',
      fetchFrequency: 'biweekly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para trabalho remoto em Portugal (nomade digital). Extraia: requisito de renda mensal minima em EUR, tipo de trabalho aceito (remoto para empresa fora de Portugal), documentos necessarios e duracao da autorizacao.',
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
    'AR subordinada': 'Autorizacao de residencia para empregado (art. 88)',
    'AR independente': 'Autorizacao de residencia para autonomo (art. 89)',
    'AR altamente qualificado': 'Autorizacao para profissional altamente qualificado (art. 90)',
    'Dispensa de visto': 'Possibilidade de pedir AR diretamente sem visto previo (beneficio para brasileiros)',
    'SNS': 'Servico Nacional de Saude portugues',
    'IEFP': 'Instituto do Emprego e Formacao Profissional',
  },
}
