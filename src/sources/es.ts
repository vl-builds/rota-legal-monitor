import type { SourceConfig } from '@/types'

// Fontes: exteriores.gob.es (Ministerio de Asuntos Exteriores) — paginas estaticas
// das secoes consulares, sem JS obrigatorio, acessiveis com UA padrao.
// inclusion.gob.es usa Liferay CMS e retorna conteudo vazio sem renderizacao JS real,
// por isso foi abandonado em favor das paginas consulares do exteriores.
export const esSource: SourceConfig = {
  countryCode: 'es',
  countryName: 'Espanha',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'es'],

  urls: [
    {
      url: 'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Visado-de-trabajo-por-cuenta-ajena.aspx',
      contentType: 'visa-overview',
      promptHint:
        'Pagina do Consulado Espanhol em Londres sobre o visto de trabalho por conta alheia (empregado). Extraia: requisitos completos, documentos exigidos, exigencia de oferta de emprego, processo de autorizacao previa pela SEPE, salario minimo exigido em EUR, prazo de validade e renovacao. Este e o tipo de visto mais comum para brasileiros.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.exteriores.gob.es/Consulados/houston/en/ServiciosConsulares/Paginas/Consular/TELEWORK-Visa-(Digital-Nomad-Visa)-.aspx',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do Consulado Espanhol em Houston sobre o visto de teletrabajo (nomade digital), criado pela Ley de Startups 28/2022. Extraia: requisitos de renda minima mensal em EUR, documentos exigidos, prazo de validade, se permite trazer familia e como renovar. Publico-alvo: profissionais que trabalham remotamente para empresas fora da Espanha.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.exteriores.gob.es/Embajadas/abudhabi/en/ServiciosConsulares/Paginas/Consular/Visado-para-trabajador-altamente-cualificado-y-para-traslado-intraempresarial.aspx',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina da Embaixada Espanhola em Abu Dhabi sobre o visto para trabalhador altamente qualificado (EU Blue Card espanhola) e transferencia intraempresarial. Extraia: criterios de qualificacao (nivel academico, salario minimo), documentos, prazo, validade e diferencas entre as duas modalidades.',
      fetchFrequency: 'monthly',
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
