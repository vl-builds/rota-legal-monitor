import type { SourceConfig } from '@/types'

// O processo francês é multietapas: visto consular no Brasil, validação pelo OFII
// ao chegar, depois solicitação de titre de séjour. O LLM deve capturar essa sequência
// e não tratar "visto" e "titre de séjour" como a mesma coisa.
// france-visas.gouv.fr e immigration.interieur.gouv.fr retornam 403 para bots.
// ofii.fr retorna 200 mas só 222 bytes (JS-only). Substituídos por páginas estáticas
// do service-public.fr que servem HTML completo sem renderização JS.
export const frSource: SourceConfig = {
  countryCode: 'fr',
  countryName: 'Franca',
  primaryLanguage: 'fr',
  acceptableLanguages: ['en', 'fr'],

  urls: [
    {
      url: 'https://www.service-public.fr/particuliers/vosdroits/F16162',
      contentType: 'visa-overview',
      promptHint:
        'Pagina do service-public.fr sobre vistos de longa duracao para a Franca (Tipo D). Extraia: tipos de visto de trabalho para brasileiros (VLS-TS valendo titre de sejour, visto sazonal, working holiday), para cada tipo indique duracao, se permite trabalhar imediatamente, documentos exigidos no consulado e se permite trazer familia.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.service-public.fr/particuliers/vosdroits/N110',
      contentType: 'visa-requirements',
      promptHint:
        'Indice de titulos de permanencia para estrangeiros no portal de servicos publicos da Franca. Extraia: tipos de titre de sejour para trabalhadores de paises nao-UE, documentos necessarios, onde solicitar (prefecture), prazo de validade e como renovar. Inclua carte de sejour temporaire mention salarie e carte pluriannuelle.',
      fetchFrequency: 'monthly',
    },
    {
      url: 'https://www.service-public.fr/particuliers/vosdroits/F16922',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do service-public.fr sobre a Carte Talent (Passeport Talent frances). Extraia: todas as categorias elegiveis (salarie qualifie, Carte Bleue Europeia, pesquisador, artista, empreendedor, profissional de saude), requisitos de remuneracao minima em EUR por categoria, processo de solicitacao, taxa e extensao para familia.',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      url: 'https://www.service-public.fr/particuliers/vosdroits/F2728',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do service-public.fr sobre autorizacao de trabalho para nao-UE na Franca. Extraia: condicoes de elegibilidade, tipos de titre de sejour associados (salarie, etudiant, ICT), procedimento de solicitacao, quem paga as taxas (empregador) e sancoes por trabalho irregular.',
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
