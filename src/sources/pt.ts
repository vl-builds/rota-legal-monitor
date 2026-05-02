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
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-visto-de-residencia-art-88-o-n-o-1',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade profissional subordinada (empregado) com visto de residencia em Portugal (Art. 88 n.1). Extraia: lista completa de documentos exigidos (passaporte, contrato, NIF, NISS, etc.), salario minimo exigido em EUR, taxa administrativa em EUR, prazo de processamento em dias, e se ha tratamento especial para cidadaos brasileiros via Estatuto de Igualdade ou Tratado de Amizade Luso-Brasileiro.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-dispensa-de-visto-de-residencia-art-88-o-n-o-',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade subordinada COM DISPENSA de visto de residencia em Portugal (Art. 88 n.2 — REVOGADO em junho 2024). Extraia: status atual da modalidade (revogada ou nao), quem era elegivel para a dispensa, documentos que eram necessarios, e o que mudou apos a revogacao pelo Decreto-Lei 37-A/2024.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-independente-com-visto-de-residencia',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade profissional independente (autonomo) em Portugal (Art. 89). Extraia: documentos exigidos (contrato de prestacao de servico, plano de negocio, NIF, etc.), comprovante de meios de subsistencia minimo em EUR/mes, taxa administrativa em EUR, prazo de processamento e requisitos especificos para profissionais liberais vs. empresarios.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-atividade-altamente-qualificada-art-90-o',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para atividade altamente qualificada em Portugal (Art. 90 — equivalente ao EU Blue Card). Extraia: salario bruto minimo anual em EUR, nivel de qualificacao academica exigido, lista de documentos, taxa em EUR, prazo de processamento e comparacao com o processo padrao.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe',
      contentType: 'visa-requirements',
      promptHint:
        'Autorizacao de residencia para trabalho remoto em Portugal (Nomada Digital). Extraia: requisito de renda mensal minima em EUR, tipo de contrato aceito (empregado ou autonomo trabalhando para empresa fora de Portugal), lista de documentos exigidos, taxa em EUR e duracao da autorizacao (1 ou 2 anos).',
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
    'AR subordinada': 'Autorizacao de residencia para empregado (art. 88)',
    'AR independente': 'Autorizacao de residencia para autonomo (art. 89)',
    'AR altamente qualificado': 'Autorizacao para profissional altamente qualificado (art. 90)',
    'Dispensa de visto': 'Possibilidade de pedir AR diretamente sem visto previo (beneficio para brasileiros)',
    'SNS': 'Servico Nacional de Saude portugues',
    'IEFP': 'Instituto do Emprego e Formacao Profissional',
  },
}
