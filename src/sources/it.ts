import type { SourceConfig } from '@/types'

// Itália tem dois documentos distintos: visto de entrada (emitido pelo consulado)
// e permesso di soggiorno (emitido pela questura após a chegada). O LLM deve
// distinguir os dois claramente. Não confundir com cittadinanza (cidadania).
// O decreto flussi (cotas anuais) é o mecanismo principal de entrada para
// trabalhadores não-UE: abre em janela específica e tem vagas limitadas.
export const itSource: SourceConfig = {
  countryCode: 'it',
  countryName: 'Italia',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'it'],

  urls: [
    {
      url: 'https://vistoperitalia.esteri.it/',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial de vistos da Italia pelo Ministerio das Relacoes Exteriores. Liste todos os tipos de visto de trabalho disponiveis para cidadaos brasileiros (lavoro subordinato, lavoro autonomo, missao, EU Blue Card). Indique documentos exigidos, necessidade de oferta de emprego e sistema de cotas (decreto flussi).',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://integrazionemigranti.gov.it/en-gb/',
      contentType: 'visa-requirements',
      promptHint:
        'Portal do Ministerio do Trabalho italiano. Extraia: como solicitar o permesso di soggiorno apos chegada, diferenca entre visto de entrada e permesso, quais permessi permitem trabalho (lavoro subordinato, autonomo, attesa occupazione) e prazos de processamento.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.poliziadistato.it/tematiche/immigrazione',
      contentType: 'visa-requirements',
      promptHint:
        'Secao de imigracao da Policia de Estado italiana. Extraia: categorias de permesso di soggiorno, documentos necessarios, onde solicitar (questura), prazo de validade por categoria e processo de renovacao.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.lavoro.gov.it/en',
      contentType: 'visa-requirements',
      promptHint:
        'Ministerio do Trabalho italiano. Extraia: direitos dos trabalhadores imigrantes, requisitos para contratacao de trabalhadores estrangeiros (nulla osta), acesso ao INPS (previdencia), mudanca de empregador e percurso para residencia permanente.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Permesso di soggiorno': 'Permissao de permanencia (documento apos chegada)',
    'Visto nazionale': 'Visto nacional de longa duracao (tipo D)',
    'Decreto flussi': 'Decreto de cotas anuais de trabalhadores imigrantes',
    'Lavoro subordinato': 'Trabalho assalariado (empregado)',
    'Lavoro autonomo': 'Trabalho autonomo (por conta propria)',
    'Questura': 'Delegacia de policia responsavel pela imigracao',
    'Sportello unico immigrazione': 'Balcao unico de imigracao',
    'Nulla osta': 'Autorizacao para contratacao de trabalhador estrangeiro',
    'Codice fiscale': 'Codigo fiscal (equivalente ao CPF)',
    'Carta di soggiorno': 'Cartao de residencia permanente',
    'Carta azzurra UE': 'EU Blue Card (permissao para altamente qualificados)',
    'Tessera sanitaria': 'Cartao de saude do SNS italiano',
    'INPS': 'Instituto Nacional da Previdencia Social',
    'SNS': 'Servico Nacional de Saude italiano',
  },
}
