import type { SourceConfig } from '@/types'

// www.inclusion.gob.es e um portal Liferay com conteudo renderizado via JS.
// O fetch nativo recebe apenas os bundles JS (sem conteudo util).
// Playwright renderiza o conteudo real e funciona corretamente no CI (Ubuntu).
// extranjeros.inclusion.gob.es/en/* foi descontinuado e redireciona para 404.
// ignoreSSL: true necessario para CA propria do governo espanhol.
export const esSource: SourceConfig = {
  countryCode: 'es',
  countryName: 'Espanha',
  primaryLanguage: 'es',
  acceptableLanguages: ['es', 'en'],

  urls: [
    {
      url: 'https://www.inclusion.gob.es/en/web/migraciones/tipos-de-autorizacion',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial espanhol sobre tipos de autorizacao de residencia e trabalho para cidadaos de fora da UE. Liste todos os tipos de autorizacao relevantes para brasileiros que querem trabalhar na Espanha: autorizacao inicial de trabalho, trabalho por conta propria, profissionais altamente qualificados, nomade digital.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://www.inclusion.gob.es/en/web/migraciones',
      contentType: 'visa-overview',
      promptHint:
        'Portal principal do Ministerio de Inclusao espanhol sobre migracao. Extraia informacoes gerais sobre requisitos de entrada e residencia para cidadaos de fora da UE, incluindo requisitos de seguro saude, prova de meios de subsistencia e antecedentes criminais. Indique se brasileiros precisam de visto.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://www.inclusion.gob.es/web/migraciones/vivir-en-espana',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina sobre como viver na Espanha para cidadaos estrangeiros. Extraia: tipos de autorizacao de residencia disponíveis para trabalhadores, documentos exigidos, requisitos de renda, prazo de processamento e qualquer tratamento especial para cidadaos ibero-americanos ou de paises com acordos bilaterais com a Espanha.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://www.inclusion.gob.es/web/migraciones/tipos-de-autorizacion',
      contentType: 'visa-requirements',
      promptHint:
        'Tipos de autorizacao de residencia e trabalho na Espanha. Extraia para cada tipo: requisitos, documentos, salario minimo em EUR, prazo de validade e como renovar. Inclua especificamente o visto de nomade digital (Ley de Startups 28/2022) e autorizacao para profissionais altamente qualificados (EU Blue Card).',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
    {
      url: 'https://www.inclusion.gob.es/web/migraciones/informacion-util',
      contentType: 'fees',
      promptHint:
        'Informacoes uteis sobre taxas e custos de autorizacoes de residencia e trabalho na Espanha (modelo 790). Extraia cada valor em EUR por tipo de autorizacao. Nao estime: use apenas valores explicitamente listados.',
      fetchFrequency: 'monthly',
      ignoreSSL: true,
    },
  ],

  glossary: {
    'Autorización de Residencia': 'Autorizacao de residencia',
    'Autorización de Trabajo': 'Autorizacao de trabalho',
    'NIE': 'Numero de Identificacion de Extranjero',
    'TIE': 'Tarjeta de Identidad de Extranjero (cartao de residente)',
    'Cuenta propia': 'Trabalho por conta propria (autonomo)',
    'Cuenta ajena': 'Trabalho por conta alheia (empregado)',
    'Arraigo': 'Autorizacao por raizamento (vinculo com Espanha)',
    'Contingente': 'Cota anual de trabalhadores imigrantes',
    'SEPE': 'Servico Publico de Emprego Estatal',
    'Nomada digital': 'Nomade digital (visto da Lei de Startups)',
    'Altamente cualificado': 'Profissional altamente qualificado',
    'Tarjeta azul UE': 'EU Blue Card (permissao para altamente qualificados)',
    'Empadronamiento': 'Registro municipal de residencia',
    'TGSS': 'Tesoreria General de la Seguridad Social',
    'Gestor': 'Despachante / advogado de imigracao',
  },
}
