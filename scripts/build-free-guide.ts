#!/usr/bin/env bun
// Gera o "Guia de início" gratuito (lead magnet) a partir dos dados públicos em data/current.
// Produz o HTML em previews/downloads/guia-inicio-rota-legal.html.
//
// O PDF é renderizado a partir desse HTML com o chrome-headless-shell (mesmo binário dos
// screenshots; o Playwright não inicia browser neste ambiente):
//
//   chrome-headless-shell --headless --no-pdf-header-footer \
//     --print-to-pdf="previews/downloads/guia-inicio-rota-legal.pdf" \
//     "file:///ABS/PATH/previews/downloads/guia-inicio-rota-legal.html"
//
// Rode com: bun run guide:build

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { CountryData, MoneyAmount, VisaType } from '@/extractors/schema'

const ROOT = join(import.meta.dir, '..')
const DATA_DIR = join(ROOT, 'data', 'current')
const OUT_DIR = join(ROOT, 'previews', 'downloads')

// Nomes com acentuação correta por código de país (o data.meta.countryName às vezes vem sem acento).
const COUNTRY_NAMES: Record<string, string> = {
  nl: 'Países Baixos', pt: 'Portugal', de: 'Alemanha', ie: 'Irlanda', es: 'Espanha',
  fr: 'França', it: 'Itália', be: 'Bélgica', at: 'Áustria', au: 'Austrália',
}

function countryName(data: CountryData): string {
  return COUNTRY_NAMES[data.meta.country] ?? data.meta.countryName
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtMoney(m: MoneyAmount | null | undefined): string | null {
  if (!m || !m.amount) return null
  const n = Math.round(m.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${m.currency} ${n}`
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[d.getUTCMonth()]}/${d.getUTCFullYear()}`
}

function hostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

// Visto principal: o de relevância "direct" ou, na falta, o primeiro listado.
function mainVisa(data: CountryData): VisaType | null {
  return data.visaTypes.find(v => v.relevanceForDelivery === 'direct') ?? data.visaTypes[0] ?? null
}

function countryCard(data: CountryData): string {
  const visa = mainVisa(data)
  const income =
    fmtMoney(visa?.requirements.incomeRequirement) ??
    fmtMoney(data.generalRequirements.minimumWage) ??
    fmtMoney(data.generalRequirements.proofOfFunds)
  const prazo = visa?.process.estimatedDuration ?? null
  const lang = visa?.requirements.languageRequired
  const source = data.meta.sources[0]?.url
  const rows: Array<[string, string]> = []
  if (visa) rows.push(['Visto principal', esc(visa.name)])
  if (income) rows.push(['Renda / salário exigido', esc(income)])
  if (prazo) rows.push(['Prazo estimado', esc(prazo)])
  if (lang) rows.push(['Idioma', esc(`${lang.language} ${lang.level}`)])
  rows.push(['Vistos mapeados', String(data.visaTypes.length)])
  if (source) rows.push(['Fonte', esc(hostname(source))])

  const tax =
    data.forBrazilians.schengenVisaFree
      ? `Brasileiros entram sem visto para turismo (até ${data.forBrazilians.maxStayDaysAsTourist} dias), mas trabalhar exige autorização.`
      : 'Brasileiros precisam de visto e autorização para trabalhar.'

  return `
  <section class="ct">
    <div class="ct-head">
      <h2>${esc(countryName(data))}</h2>
      <span class="ct-upd">Atualizado em ${monthLabel(data.meta.lastUpdated)}</span>
    </div>
    <p class="ct-intro">${esc(tax)}</p>
    <table class="ct-table">
      ${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('\n      ')}
    </table>
  </section>`
}

function buildHtml(all: CountryData[]): string {
  const sorted = [...all].sort((a, b) => countryName(a).localeCompare(countryName(b), 'pt'))
  const latest = all.reduce((b, d) => (d.meta.lastUpdated > b ? d.meta.lastUpdated : b), '')
  const cards = sorted.map(countryCard).join('\n')

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Guia de início · Rota Legal</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Inter", -apple-system, system-ui, sans-serif;
    background: #0a0a0a; color: #e6e6e6; margin: 0; padding: 32px 36px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .cover { padding: 24px 0 32px; border-bottom: 1px solid #2a2a2a; margin-bottom: 32px; }
  .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f0b429; margin: 0 0 12px; }
  h1 { font-size: 34px; font-weight: 700; letter-spacing: -1px; color: #fff; margin: 0 0 12px; line-height: 1.1; }
  .lead { font-size: 14px; color: #bbb; line-height: 1.7; max-width: 640px; margin: 0; }
  .ct { padding: 20px 0; border-bottom: 1px solid #1f1f1f; page-break-inside: avoid; }
  .ct-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .ct-head h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0; letter-spacing: -0.4px; }
  .ct-upd { font-size: 11px; color: #888; font-family: "JetBrains Mono", monospace; white-space: nowrap; }
  .ct-intro { font-size: 13px; color: #aaa; line-height: 1.5; margin: 6px 0 12px; }
  .ct-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ct-table th { text-align: left; color: #888; font-weight: 500; padding: 5px 12px 5px 0; width: 200px; vertical-align: top; white-space: nowrap; }
  .ct-table td { color: #e6e6e6; padding: 5px 0; }
  .closing { margin-top: 32px; padding-top: 24px; border-top: 1px solid #2a2a2a; }
  .closing h2 { font-size: 18px; color: #fff; margin: 0 0 8px; }
  .closing p { font-size: 13px; color: #bbb; line-height: 1.7; margin: 0 0 10px; max-width: 640px; }
  .disclaimer { font-size: 12px; color: #888; line-height: 1.6; margin-top: 16px; }
  .disclaimer strong { color: #f0b429; }
  a { color: #f0b429; text-decoration: none; }
</style>
</head>
<body>
  <div class="cover">
    <p class="eyebrow">Rota Legal · Guia gratuito</p>
    <h1>Trabalhar no exterior:<br>o ponto de partida em 10 países</h1>
    <p class="lead">Um resumo direto das regras de imigração para brasileiros que pensam em trabalhar fora, montado a partir de fontes oficiais e atualizado mensalmente. Use como mapa inicial e confirme sempre na fonte antes de agir. Dados de ${monthLabel(latest)}.</p>
  </div>

  ${cards}

  <div class="closing">
    <h2>Como usar o Rota Legal</h2>
    <p>No site você compara países lado a lado, descobre qual destino combina com o seu perfil pelo questionário, calcula a reserva necessária e acompanha o histórico de mudanças mês a mês. Tudo gratuito e com as fontes linkadas.</p>
    <p>Acesse <a href="https://rotalegal.pro">rotalegal.pro</a> e receba as atualizações no seu email.</p>
    <p class="disclaimer"><strong>Aviso:</strong> o Rota Legal não é escritório de advocacia e não presta assessoria jurídica. As informações são extraídas automaticamente, com confiança média e sem revisão humana completa. Para um processo real de visto, consulte um advogado de imigração licenciado no país de destino.</p>
  </div>
</body>
</html>`
}

async function main(): Promise<void> {
  const files = await readdir(DATA_DIR)
  const codes = files
    .filter(f => f.endsWith('.json') && f !== 'example.json' && f !== 'index.json')
    .map(f => f.replace('.json', ''))

  const all: CountryData[] = []
  for (const code of codes) {
    const raw = await readFile(join(DATA_DIR, `${code}.json`), 'utf-8')
    all.push(JSON.parse(raw) as CountryData)
  }

  await mkdir(OUT_DIR, { recursive: true })
  const html = buildHtml(all)
  const outHtml = join(OUT_DIR, 'guia-inicio-rota-legal.html')
  await writeFile(outHtml, html, 'utf-8')
  console.log(`[ok] guia HTML gerado: ${outHtml} (${all.length} países)`)
  console.log('[próximo] renderize o PDF com chrome-headless-shell --print-to-pdf (ver cabeçalho do script).')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
