import type { SourceConfig } from '@/types'

// A Red-White-Red Card (RWR) é o sistema de pontuação austríaco com várias subcategorias.
// O LLM deve listar as subcategorias separadamente: Very Highly Qualified Workers,
// Skilled Workers in Shortage Occupations, Other Key Workers.
// Algumas categorias exigem proficiência em alemão: capturar o nível CEFR exigido.
// audienceFit: 'narrow' - mercado de delivery menor que nos países maiores.
export const atSource: SourceConfig = {
  countryCode: 'at',
  countryName: 'Austria',
  primaryLanguage: 'en',
  acceptableLanguages: ['en', 'de'],

  urls: [
    {
      url: 'https://www.migration.gv.at/en/',
      contentType: 'visa-overview',
      promptHint:
        'Portal oficial de migracao da Austria. Liste os tipos de autorizacao de residencia e trabalho disponiveis para brasileiros: Red-White-Red Card (RWR), EU Blue Card, autorizacao para trabalhadores sazonais. Indique qual e o caminho mais acessivel para trabalhadores sem qualificacao europeia reconhecida.',
      fetchFrequency: 'monthly',
    },
    {
      // URL PHP direta — as "pretty URLs" do migration.gv.at redirecionam 303 e retornam 100 chars
      url: 'https://www.migration.gv.at/index.php?id=1049',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do Red-White-Red Card para Very Highly Qualified Workers (trabalhadores altamente qualificados) na Austria. Extraia: pontuacao minima exigida (geralmente 70 pontos), tabela de criterios de pontuacao (idade, educacao, experiencia, idioma), salario minimo em EUR por mes, nivel CEFR de alemao exigido, documentos necessarios e onde solicitar (MA 35 em Viena ou Landeshauptmann fora de Viena).',
      fetchFrequency: 'monthly',
      model: 'sonnet',
    },
    {
      // URL PHP direta — Skilled Workers in Shortage Occupations (Mangelberuf)
      url: 'https://www.migration.gv.at/index.php?id=1050',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do Red-White-Red Card para Skilled Workers in Shortage Occupations (profissoes em escassez) na Austria. Extraia: lista de profissoes Mangelberuf elegíveis, pontuacao minima exigida, criterios de pontuacao, salario minimo em EUR, nivel CEFR de alemao exigido (geralmente A2 ou B1), documentos necessarios e tempo medio de processamento.',
      fetchFrequency: 'monthly',
    },
    {
      // URL PHP direta — Other Key Workers
      url: 'https://www.migration.gv.at/index.php?id=1051',
      contentType: 'visa-requirements',
      promptHint:
        'Pagina do Red-White-Red Card para Other Key Workers (outros trabalhadores chave) na Austria. Extraia: salario minimo bruto anual exigido em EUR, pontuacao minima (geralmente 55 pontos), tabela de criterios de pontuacao, nivel CEFR de alemao, documentos necessarios e diferenca principal em relacao as outras categorias RWR Card.',
      fetchFrequency: 'monthly',
    },
  ],

  glossary: {
    'Rot-Weiß-Rot Karte': 'Red-White-Red Card (cartao de residencia por pontos)',
    'Aufenthaltstitel': 'Autorizacao de residencia',
    'Niederlassungsbewilligung': 'Autorizacao de estabelecimento permanente',
    'AMS': 'Servico Publico de Emprego austriaco',
    'BFA': 'Escritorio Federal de Imigracao e Asilo',
    'MA 35': 'Departamento de imigracao da cidade de Viena',
    'ÖSD': 'Diploma de idioma alemao austriaco (reconhecido para visto)',
    'WKO': 'Camara Economica Federal austriaca',
    'Mangelberuf': 'Profissao em escassez na Austria',
    'Fachkraft': 'Trabalhador qualificado',
    'E-Card': 'Cartao de seguro saude austriaco',
    'SVS': 'Seguro Social para Trabalhadores Autonomos',
    'BMEIA': 'Ministerio Federal dos Negocios Estrangeiros austriaco',
    'Sprachzeugnis': 'Certificado de proficiencia em idioma',
  },
}
