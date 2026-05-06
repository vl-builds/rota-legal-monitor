// ===== DATA =====
// Países com perfis sintéticos (1-5) usados pra calcular match.
// jobs: facilidade de encontrar emprego formal pra estrangeiro
// freelance: ambiente pra aut\u00f4nomo / nômade
// startup: facilidade pra abrir empresa
// english: o quanto você sobrevive só com inglês
// cost: custo de vida (5 = caro, 1 = barato)
// salary: nível salarial médio
// family: infraestrutura pra família/escolas
// residency: caminho pra residência permanente / cidadania
// stay: vibe pra ficar 1-2 anos só (turismo/visto temporário)
const COUNTRIES = [
  {
    code: "NL", name: "Países Baixos", capital: "Amsterdam",
    flag: ["#AE1C28", "#FFFFFF", "#21468B"],
    accent: "#FF6B35",
    tagline: "Inglês em todo lugar, vistos para skilled migrants.",
    profile: { jobs: 5, freelance: 4, startup: 4, english: 5, cost: 4, salary: 5, family: 4, residency: 4, stay: 4 },
    sectors: { tech: 5, health: 4, eng: 4, food: 3, edu: 4, other: 3 },
    visa: "Highly Skilled Migrant", citizenship: "5 anos"
  },
  {
    code: "PT", name: "Portugal", capital: "Lisboa",
    flag: ["#046A38", "#DA291C"],
    accent: "#16A34A",
    tagline: "Idioma fácil, comunidade brasileira, vistos D7/D8.",
    profile: { jobs: 3, freelance: 5, startup: 4, english: 3, cost: 3, salary: 2, family: 4, residency: 5, stay: 5 },
    sectors: { tech: 4, health: 4, eng: 3, food: 4, edu: 3, other: 4 },
    visa: "D7 / D8 Nômade", citizenship: "5 anos"
  },
  {
    code: "DE", name: "Alemanha", capital: "Berlim",
    flag: ["#000000", "#DD0000", "#FFCE00"],
    accent: "#DD0000",
    tagline: "Vagas em engenharia e tech, salários sólidos.",
    profile: { jobs: 5, freelance: 3, startup: 3, english: 4, cost: 4, salary: 5, family: 5, residency: 4, stay: 3 },
    sectors: { tech: 5, health: 4, eng: 5, food: 3, edu: 4, other: 3 },
    visa: "Blue Card / Chancenkarte", citizenship: "5 anos"
  },
  {
    code: "IE", name: "Irlanda", capital: "Dublin",
    flag: ["#169B62", "#FFFFFF", "#FF883E"],
    accent: "#169B62",
    tagline: "Hub de tech em inglês, mas custo de vida alto.",
    profile: { jobs: 4, freelance: 3, startup: 4, english: 5, cost: 5, salary: 5, family: 4, residency: 3, stay: 4 },
    sectors: { tech: 5, health: 4, eng: 4, food: 3, edu: 4, other: 3 },
    visa: "Critical Skills", citizenship: "5 anos"
  },
  {
    code: "ES", name: "Espanha", capital: "Madrid",
    flag: ["#AA151B", "#F1BF00"],
    accent: "#F1BF00",
    tagline: "Cultura latina, visto de nômade competitivo.",
    profile: { jobs: 3, freelance: 4, startup: 3, english: 2, cost: 3, salary: 3, family: 4, residency: 4, stay: 4 },
    sectors: { tech: 3, health: 4, eng: 3, food: 4, edu: 3, other: 4 },
    visa: "Nômade Digital", citizenship: "10 anos (2 p/ ibero)"
  },
  {
    code: "FR", name: "França", capital: "Paris",
    flag: ["#0055A4", "#FFFFFF", "#EF4135"],
    accent: "#0055A4",
    tagline: "Saúde pública forte, mas bureaucracia pesada.",
    profile: { jobs: 3, freelance: 3, startup: 4, english: 2, cost: 4, salary: 4, family: 5, residency: 4, stay: 3 },
    sectors: { tech: 4, health: 5, eng: 4, food: 4, edu: 4, other: 3 },
    visa: "Passeport Talent", citizenship: "5 anos"
  },
  {
    code: "IT", name: "Itália", capital: "Roma",
    flag: ["#008C45", "#F4F5F0", "#CD212A"],
    accent: "#008C45",
    tagline: "Cidadania por descendência ainda é o atalho.",
    profile: { jobs: 2, freelance: 4, startup: 3, english: 2, cost: 3, salary: 2, family: 4, residency: 4, stay: 5 },
    sectors: { tech: 3, health: 4, eng: 3, food: 5, edu: 3, other: 3 },
    visa: "Lavoro / Nômade", citizenship: "10 anos (descend.)"
  },
  {
    code: "BE", name: "Bélgica", capital: "Bruxelas",
    flag: ["#000000", "#FAE042", "#ED2939"],
    accent: "#FAE042",
    tagline: "Centro da UE, multilíngue, vagas internacionais.",
    profile: { jobs: 4, freelance: 3, startup: 3, english: 4, cost: 4, salary: 4, family: 4, residency: 4, stay: 3 },
    sectors: { tech: 4, health: 4, eng: 4, food: 3, edu: 4, other: 3 },
    visa: "Single Permit", citizenship: "5 anos"
  },
  {
    code: "AU", name: "Austrália", capital: "Canberra",
    flag: ["#012169", "#FFFFFF", "#E4002B"],
    accent: "#012169",
    tagline: "Salários altos, working holiday até 35 anos.",
    profile: { jobs: 5, freelance: 3, startup: 4, english: 5, cost: 5, salary: 5, family: 5, residency: 3, stay: 5 },
    sectors: { tech: 4, health: 5, eng: 5, food: 4, edu: 4, other: 4 },
    visa: "Skilled Independent / WHV", citizenship: "4 anos"
  },
  {
    code: "AT", name: "Áustria", capital: "Viena",
    flag: ["#ED2939", "#FFFFFF"],
    accent: "#ED2939",
    tagline: "Qualidade de vida no topo, alemão é importante.",
    profile: { jobs: 4, freelance: 2, startup: 3, english: 3, cost: 4, salary: 4, family: 5, residency: 3, stay: 3 },
    sectors: { tech: 4, health: 4, eng: 4, food: 3, edu: 4, other: 3 },
    visa: "Rot-Weiß-Rot", citizenship: "10 anos"
  }
];

// ===== QUESTIONS =====
const QUESTIONS = [
  {
    id: "situation",
    sceneKind: "shapes",
    eyebrow: "Sobre você",
    title: "Como você ganha a vida hoje?",
    subtitle: "Vou cruzar isso com os tipos de visto que cada país oferece.",
    options: [
      { id: "employed", label: "Empregado CLT", hint: "Salário fixo, carteira assinada", weights: { jobs: 3 } },
      { id: "freelance", label: "Freelancer / autônomo", hint: "Trabalho remoto, clientes próprios", weights: { freelance: 3 } },
      { id: "founder",   label: "Empreendedor", hint: "Tenho ou quero abrir empresa", weights: { startup: 3 } },
      { id: "student",   label: "Estudante / recém-formado", hint: "Saindo da faculdade ou trocando de área", weights: { stay: 2, residency: 1 } }
    ]
  },
  {
    id: "field",
    sceneKind: "sectors",
    eyebrow: "Pergunta 02",
    title: "Em qual setor você atua?",
    subtitle: "Cada país tem demandas e visto específico por área.",
    options: [
      { id: "tech",    label: "TI & tecnologia", glyph: "{ }", weightsKey: "tech" },
      { id: "health",  label: "Saúde",            glyph: "✚",   weightsKey: "health" },
      { id: "eng",     label: "Engenharia & construção", glyph: "▲", weightsKey: "eng" },
      { id: "food",    label: "Gastronomia & hospitalidade", glyph: "◖", weightsKey: "food" },
      { id: "edu",     label: "Educação & pesquisa", glyph: "§", weightsKey: "edu" },
      { id: "other",   label: "Outra área",       glyph: "◇", weightsKey: "other" }
    ]
  },
  {
    id: "english",
    sceneKind: "fluency",
    eyebrow: "Pergunta 03",
    title: "Como está seu inglês?",
    subtitle: "Isso muda muito o leque de países viáveis.",
    options: [
      { id: "fluent",  label: "Fluente / avançado",   level: 4, weights: { english: 3 } },
      { id: "working", label: "Trabalho em inglês",   level: 3, weights: { english: 2 } },
      { id: "basic",   label: "Básico, melhorando",   level: 2, weights: { english: 0 } },
      { id: "avoid",   label: "Prefiro evitar",        level: 1, weights: { english: -2 } }
    ]
  },
  {
    id: "goal",
    sceneKind: "horizon",
    eyebrow: "Pergunta 04",
    title: "Qual seu plano principal?",
    subtitle: "O destino certo depende do que você quer construir lá.",
    options: [
      { id: "job",       label: "Conseguir emprego formal rápido", arrow: "→", weights: { jobs: 3 } },
      { id: "business",  label: "Abrir meu próprio negócio",        arrow: "↑", weights: { startup: 3 } },
      { id: "experience",label: "Ficar 1–2 anos pela experiência",   arrow: "↗", weights: { stay: 3 } },
      { id: "settle",    label: "Fixar residência e ir pra cidadania", arrow: "⇢", weights: { residency: 3 } }
    ]
  },
  {
    id: "family",
    sceneKind: "company",
    eyebrow: "Pergunta 05",
    title: "Vai com quem?",
    subtitle: "Famílias mudam o cálculo: escola, saúde, espaço.",
    options: [
      { id: "solo",   label: "Vou sozinho(a)",        people: 1, weights: { stay: 1 } },
      { id: "couple", label: "Com cônjuge / parceiro(a)", people: 2, weights: { residency: 2, family: 1 } },
      { id: "kids",   label: "Família com filhos",    people: 3, weights: { family: 3, residency: 1 } }
    ]
  },
  {
    id: "money",
    sceneKind: "balance",
    eyebrow: "Pergunta 06",
    title: "Onde você prioriza o dinheiro?",
    subtitle: "Custo baixo, salário alto, ou meio-termo.",
    options: [
      { id: "cheap",   label: "Custo de vida o mais baixo",        bias: -1, weights: { cost: -3, salary: 0 } },
      { id: "balance", label: "Equilíbrio entre renda e custo",     bias: 0,  weights: { cost: -1, salary: 1 } },
      { id: "salary",  label: "Salário alto, aceito custo alto",    bias: 1,  weights: { salary: 3 } }
    ]
  }
];

// ===== SCORING =====
function scoreCountries(answers) {
  return COUNTRIES.map(c => {
    let score = 50; // baseline
    let breakdown = {};

    // Q1 — situation
    const a1 = answers.situation;
    if (a1 === "employed")  score += c.profile.jobs * 4;
    if (a1 === "freelance") score += c.profile.freelance * 4;
    if (a1 === "founder")   score += c.profile.startup * 4;
    if (a1 === "student")   score += (c.profile.stay + c.profile.residency) * 2;

    // Q2 — field
    const a2 = answers.field;
    if (a2 && c.sectors[a2] != null) score += c.sectors[a2] * 4;

    // Q3 — english
    const a3 = answers.english;
    if (a3 === "fluent")  score += c.profile.english * 3;
    if (a3 === "working") score += c.profile.english * 2;
    if (a3 === "basic")   score += (5 - c.profile.english) * 1;  // se prefere evitar inglês, valoriza países onde o local idioma manda
    if (a3 === "avoid")   score += (5 - c.profile.english) * 3;

    // Q4 — goal
    const a4 = answers.goal;
    if (a4 === "job")        score += c.profile.jobs * 3;
    if (a4 === "business")   score += c.profile.startup * 3;
    if (a4 === "experience") score += c.profile.stay * 3;
    if (a4 === "settle")     score += c.profile.residency * 4;

    // Q5 — family
    const a5 = answers.family;
    if (a5 === "couple") score += c.profile.family * 2;
    if (a5 === "kids")   score += c.profile.family * 4;
    if (a5 === "solo")   score += c.profile.stay * 2;

    // Q6 — money
    const a6 = answers.money;
    if (a6 === "cheap")   score += (6 - c.profile.cost) * 3;
    if (a6 === "balance") score += (c.profile.salary - c.profile.cost + 5) * 2;
    if (a6 === "salary")  score += c.profile.salary * 3;

    // normalize
    const match = Math.max(20, Math.min(99, Math.round(score / 1.7)));
    return { ...c, score, match };
  }).sort((a, b) => b.match - a.match);
}

// Always-on partial scoring even with 1-2 answers
function partialRanking(answers) {
  const filled = Object.values(answers).filter(Boolean).length;
  if (filled === 0) {
    // default: highlight 3 popular ones
    return COUNTRIES.filter(c => ["NL","PT","DE"].includes(c.code))
      .map(c => ({ ...c, match: null }));
  }
  return scoreCountries(answers).slice(0, 3);
}

window.QUIZ_COUNTRIES = COUNTRIES;
window.QUIZ_QUESTIONS = QUESTIONS;
window.scoreCountries = scoreCountries;
window.partialRanking = partialRanking;
