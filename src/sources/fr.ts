import type { SourceConfig } from '@/types'

// O processo francês é multietapas: visto consular no Brasil, validação pelo OFII
// ao chegar, depois solicitação de titre de séjour. O LLM deve capturar essa sequência
// e não tratar "visto" e "titre de séjour" como a mesma coisa.
// URLs do Ministério do Interior têm terminologia jurídica densa: usar Sonnet.
export const frSource: SourceConfig = {
  countryCode: 'fr',
  countryName: 'Franca',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'fr'],

  urls: [
    {
      url: 'https://france-visas.gouv.fr/en/web/france-visas/',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial de vistos da Franca. Liste os tipos de visto de trabalho para brasileiros: visto de longa duracao (VLS-TS), visto talento (Passeport Talent), visto trabalhador sazonal. Para cada tipo indique se permite trabalhar imediatamente, duracao maxima e se permite trazer familia.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.service-public.fr/particuliers/vosdroits/N110',
      contentType: 'visa-requirements',
      promptHint:
        'Direitos de estrangeiros no portal de servicos publicos da Franca. Extraia: tipos de titre de séjour para trabalhadores de paises nao-UE, documentos necessarios, onde solicitar (prefecture), prazo de validade e como renovar. Inclua carte de séjour temporaire mention salarié e carte pluriannuelle.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.immigration.interieur.gouv.fr/Immigration/L-immigration-en-France',
      contentType: 'visa-requirements',
      promptHint:
        'Ministerio do Interior frances sobre imigracao. Extraia: processo completo de imigracao para trabalhadores (visto consular, validacao OFII, titre de séjour), tipos de autorizacao de trabalho, salario minimo para Passeport Talent, diferenca entre trabalho assalariado e independente.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.ofii.fr/',
      contentType: 'agreements',
      promptHint:
        'OFII, organismo frances de integracao de imigrantes. Extraia: o que acontece no processo de validacao do visto apos chegada, quais documentos o imigrante precisa apresentar ao OFII, quais servicos o OFII oferece (aulas de frances, integracao) e se ha algum acordo especial para brasileiros.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Titre de séjour': 'Autorizacao de residencia',
    'Carte de séjour': 'Cartao de residencia',
    'VLS-TS': 'Visto de longa duracao valendo titre de séjour',
    'Passeport Talent': 'Visto talento para profissionais qualificados',
    'Salarié': 'Trabalhador assalariado (empregado)',
    'Indépendant': 'Trabalhador autonomo',
    'OFII': 'Escritorio Frances de Imigracao e Integracao',
    'Préfecture': 'Prefeitura (autoridade administrativa regional)',
    'Autorisation de travail': 'Autorizacao de trabalho',
    'DIRECCTE': 'Direcao regional de empresas, concorrencia, consumo, trabalho e emprego',
    'Contrat de travail': 'Contrato de trabalho',
    'Carte pluriannuelle': 'Cartao de residencia plurianual (4 anos)',
    'Naturalisation': 'Naturalizacao (cidadania francesa)',
    'SMIC': 'Salario minimo intercategorias (equivalente ao salario minimo frances)',
    'INSEE': 'Instituto nacional de estatisticas e estudos economicos',
  },
}
