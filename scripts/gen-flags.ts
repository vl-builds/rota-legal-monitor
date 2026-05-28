#!/usr/bin/env bun
/**
 * Gera bandeiras SVG vetoriais (leves, nitidas) em previews/imagens/flags/.
 * Substitui os PNGs de ~3,5MB que viviam em imagens/ (gitignorada, fora do deploy).
 * As formas reaproveitam a arte ja usada na comparar.html (funcao flagSVG).
 * viewBox 60x40 (proporcao 3:2).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(import.meta.dir, '..', 'previews', 'imagens', 'flags')
mkdirSync(OUT, { recursive: true })

const t = 40 / 3 // faixa horizontal (13.333)

const defs: Record<string, string> = {
  nl: `<rect width="60" height="${t}" fill="#AE1C28"/><rect y="${t}" width="60" height="${t}" fill="#FFF"/><rect y="${2 * t}" width="60" height="${t}" fill="#21468B"/>`,
  de: `<rect width="60" height="${t}" fill="#000"/><rect y="${t}" width="60" height="${t}" fill="#DD0000"/><rect y="${2 * t}" width="60" height="${t}" fill="#FFCE00"/>`,
  at: `<rect width="60" height="${t}" fill="#ED2939"/><rect y="${t}" width="60" height="${t}" fill="#FFF"/><rect y="${2 * t}" width="60" height="${t}" fill="#ED2939"/>`,
  es: `<rect width="60" height="10" fill="#c60b1e"/><rect y="10" width="60" height="20" fill="#ffc400"/><rect y="30" width="60" height="10" fill="#c60b1e"/>`,
  ie: `<rect width="20" height="40" fill="#169B62"/><rect x="20" width="20" height="40" fill="#FFF"/><rect x="40" width="20" height="40" fill="#FF883E"/>`,
  fr: `<rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="#FFF"/><rect x="40" width="20" height="40" fill="#ED2939"/>`,
  it: `<rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#FFF"/><rect x="40" width="20" height="40" fill="#CE2B37"/>`,
  be: `<rect width="20" height="40" fill="#000"/><rect x="20" width="20" height="40" fill="#FAE042"/><rect x="40" width="20" height="40" fill="#ED2939"/>`,
  pt: `<rect width="24" height="40" fill="#006600"/><rect x="24" width="36" height="40" fill="#FF0000"/><circle cx="24" cy="20" r="10" fill="#FFD700" stroke="#660000" stroke-width="0.6"/><circle cx="24" cy="20" r="6.2" fill="#fff" stroke="#003399" stroke-width="0.5"/>`,
  au: `<rect width="60" height="40" fill="#00247D"/><circle cx="15" cy="29" r="4" fill="#fff"/><circle cx="44" cy="10" r="1.7" fill="#fff"/><circle cx="52" cy="18" r="1.7" fill="#fff"/><circle cx="45" cy="27" r="1.7" fill="#fff"/><circle cx="37" cy="20" r="1.2" fill="#fff"/><circle cx="49" cy="33" r="1.3" fill="#fff"/>`,
}

for (const [cc, inner] of Object.entries(defs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">${inner}</svg>\n`
  writeFileSync(join(OUT, `${cc}.svg`), svg, 'utf8')
}
console.log(`[gen-flags] ${Object.keys(defs).length} bandeiras SVG em previews/imagens/flags/`)
