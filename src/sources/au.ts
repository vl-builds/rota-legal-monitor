import type { SourceConfig } from '@/types'

// A Austrália não faz parte do Schengen. Qualquer entrada exige visto.
// O Working Holiday Visa subclass 462 é o caminho mais acessível para brasileiros:
// tem limite de idade (18 a 30 anos, até 35 em casos específicos) e cota anual limitada.
// audienceFit: 'narrow' - o público-alvo principal do HenryZuka é Europa.
// schengenVisaFree: false, maxStayDaysAsTourist: 0 (exige visto até para turismo).
export const auSource: SourceConfig = {
  countryCode: 'au',
  countryName: 'Australia',
  primaryLanguage: 'en',
  acceptableLanguages: ['en'],

  urls: [
    {
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462',
      contentType: 'visa-requirements',
      promptHint:
        'Working Holiday Visa subclass 462 da Australia para brasileiros. Extraia: limite de idade (tipicamente 18 a 30 anos, verificar se Brasil tem extensao ate 35), cota anual de vagas para brasileiros, taxa de solicitacao em AUD, restricoes de trabalho durante a estadia (max 6 meses por empregador), possibilidade de segunda e terceira visa por trabalho regional e como solicitar online.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189',
      contentType: 'visa-requirements',
      promptHint:
        'Skilled Independent visa subclass 189 da Australia (residencia permanente). Extraia: sistema de pontuacao SkillSelect, pontuacao minima para convite (invitation round), lista de profissoes elegíveis (SOL), reconhecimento de diploma por Skills Assessment, e taxa de solicitacao em AUD.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482',
      contentType: 'visa-requirements',
      promptHint:
        'Temporary Skill Shortage visa subclass 482 da Australia. Extraia: diferenca entre Short-term stream e Medium-term stream, salario minimo (TSMIT em AUD), patrocinio de empregador necessario, profissoes elegíveis por stream e caminho para residencia permanente apos este visto.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder',
      contentType: 'visa-overview',
      promptHint:
        'Buscador oficial de vistos australianos. Extraia a listagem geral de tipos de visto de trabalho disponiveis para brasileiros: temporarios (Working Holiday 462, TSS 482, Graduate 485) e permanentes (Skilled Independent 189, Skilled Nominated 190). Para cada um indique o caminho mais curto e se exige patrocinio de empregador.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Working Holiday Visa': 'Visto de ferias e trabalho (WHV)',
    'Skilled Independent visa': 'Visto de habilidades independente (residencia permanente)',
    'Temporary Skill Shortage': 'Escassez temporaria de habilidades (TSS)',
    'SkillSelect': 'Sistema de selecao de habilidades (expressa interesse)',
    'SOL': 'Lista de ocupacoes qualificadas para imigracao',
    'TSMIT': 'Limite de renda minima para trabalhador estrangeiro (em AUD)',
    'TFN': 'Tax File Number (equivalente ao CPF)',
    'Medicare': 'Sistema de saude publica australiano',
    'Department of Home Affairs': 'Ministerio dos Assuntos Internos (imigracao)',
    'Sponsor': 'Empregador patrocinador do visto de trabalho',
    'Skills Assessment': 'Avaliacao de qualificacoes estrangeiras',
    'EOI': 'Expressao de Interesse (passo inicial no SkillSelect)',
    'Graduate visa 485': 'Visto para recem-formados em universidade australiana',
    'Regional work': 'Trabalho em regiao designada (requisito para segunda WHV)',
  },
}
