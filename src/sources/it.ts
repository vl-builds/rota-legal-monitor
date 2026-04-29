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
      url: 'https://vistoperitalia.esteri.it/home/en',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial de vistos da Italia pelo Ministerio das Relacoes Exteriores. Liste todos os tipos de visto de trabalho disponiveis para cidadaos brasileiros (trabalho subordinado, trabalho autonomo, missao, EU Blue Card). Indique se o visto e de longa duracao (nacional, tipo D) ou curta (tipo C).',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.esteri.it/en/servizi-consolari-e-visti/visti/',
      contentType: 'visa-requirements',
      promptHint:
        'Tipos de visto disponíveis na Italia para trabalho. Extraia: documentos exigidos por tipo, se e necessario ter oferta de emprego previamente, se ha sistema de cotas (decreto flussi) e como funciona. Destaque especificamente o visto para trabalho subordinado e o EU Blue Card.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://integrazionemigranti.gov.it/en-gb/',
      contentType: 'visa-requirements',
      promptHint:
        'Portal do Ministerio do Trabalho italiano sobre integracao de imigrantes. Extraia: como solicitar o permesso di soggiorno apos chegada, diferenca entre visto de entrada e permesso, quais permessi permitem trabalho (lavoro subordinato, autonomo, attesa occupazione) e prazos.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.poliziadistato.it/articolo/permessi-di-soggiorno-per-cittadini-stranieri',
      contentType: 'visa-requirements',
      promptHint:
        'Permessi di soggiorno para cidadaos estrangeiros na Italia. Extraia: quais categorias existem, documentos necessarios para solicitar, onde solicitar (questura), prazo de validade por categoria e como renovar. Inclua permesso per attesa occupazione (aguardando emprego) se disponivel.',
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
