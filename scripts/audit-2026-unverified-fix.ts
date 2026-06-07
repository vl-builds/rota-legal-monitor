/**
 * Corrige os itens UNVERIFIED da auditoria 2026 com valores confirmados via fontes oficiais.
 *
 * Fontes:
 *   NL self-employed: ind.nl/en/required-amounts-income-requirements (01/01/2026)
 *   IE sport-cultural/internship: enterprise.gov.ie (01/01/2026)
 *   FR PVT: consulado francês em Recife + pvtistes.net (campanha 2026)
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const CURRENT = join(ROOT, "data", "current");
const PATCHES = join(ROOT, "scripts", "patches");

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ─── NL: self-employed ────────────────────────────────────────────────────────

const nlCurrent = readJson(join(CURRENT, "nl.json"));
const nlPatch = readJson(join(PATCHES, "nl.json"));

// 1. Atualiza knownIssues do NL
nlCurrent.reliability.knownIssues = (nlCurrent.reliability.knownIssues as string[]).map(
  (issue: string) => {
    if (issue.includes("self-employed") && issue.includes("UNVERIFIED")) {
      return (
        "self-employed: IND exige lucro bruto mínimo de €1.734,57/mês (com férias, vigente 01/01/2026–30/06/2026). " +
        "Fonte: ind.nl/en/required-amounts-income-requirements. " +
        "start-up-founder: sem limiar de renda fixo IND — requer facilitador RVO reconhecido e avaliação por pontos (mínimo 90/100). " +
        "Ver ind.nl/en/residence-permits/work/start-up. [verificado 2026-06-07]"
      );
    }
    return issue;
  }
);

// 2. Atualiza patch NL self-employed
if (nlPatch["self-employed"]?.requirements?.incomeRequirement) {
  nlPatch["self-employed"].requirements.incomeRequirement.amount = 1734.57;
  nlPatch["self-employed"].requirements.incomeRequirement.notes =
    "Lucro bruto mínimo exigido pelo IND para autônomo: €1.734,57/mês (com férias, vigente 01/01–30/06/2026). " +
    "Não é um limiar de salário fixo, mas de lucro bruto da atividade. Fonte: ind.nl/en/required-amounts-income-requirements.";
}

writeJson(join(CURRENT, "nl.json"), nlCurrent);
writeJson(join(PATCHES, "nl.json"), nlPatch);
console.log("✓ NL: self-employed atualizado (€1.400 → €1.734,57/mês)");

// ─── IE: sport-cultural e internship ─────────────────────────────────────────

const ieCurrent = readJson(join(CURRENT, "ie.json"));
const iePatch = readJson(join(PATCHES, "ie.json"));

// NMW Irlanda 01/01/2026: €14,15/h × 39h × 52 semanas = €28.696,20/ano
const NMW_IE_2026 = 28696.2;
const NMW_IE_NOTES =
  "National Minimum Wage (NMW): €14,15/h × 39h × 52 semanas = €28.696,20/ano a partir de 01/01/2026. " +
  "Fonte: enterprise.gov.ie e employment permits notices 2026.";

// 3. Atualiza knownIssues da IE
ieCurrent.reliability.knownIssues = (ieCurrent.reliability.knownIssues as string[]).map(
  (issue: string) => {
    if (issue.includes("sport-cultural") && issue.includes("UNVERIFIED")) {
      return (
        "sport-cultural e internship: salário mínimo exigido é NMW (€14,15/h) ou superior. " +
        "Em 2026: €14,15/h × 39h × 52 semanas = €28.696,20/ano. Ambos confirmados via enterprise.gov.ie. " +
        "Valores anteriores (€30.000 e €22.920) eram obsoletos. [verificado 2026-06-07]"
      );
    }
    return issue;
  }
);

// 4. Atualiza patch IE sport-cultural
if (iePatch["sport-cultural-employment-permit"]?.requirements?.incomeRequirement) {
  iePatch["sport-cultural-employment-permit"].requirements.incomeRequirement.amount = NMW_IE_2026;
  iePatch["sport-cultural-employment-permit"].requirements.incomeRequirement.notes = NMW_IE_NOTES;
}

// 5. Atualiza patch IE internship
if (iePatch["internship-employment-permit"]?.requirements?.incomeRequirement) {
  iePatch["internship-employment-permit"].requirements.incomeRequirement.amount = NMW_IE_2026;
  iePatch["internship-employment-permit"].requirements.incomeRequirement.notes = NMW_IE_NOTES;
}

writeJson(join(CURRENT, "ie.json"), ieCurrent);
writeJson(join(PATCHES, "ie.json"), iePatch);
console.log("✓ IE: sport-cultural €30.000 → €28.696,20; internship €22.920 → €28.696,20");

// ─── FR: working-holiday-brasil ───────────────────────────────────────────────

const frCurrent = readJson(join(CURRENT, "fr.json"));
const frPatch = readJson(join(PATCHES, "fr.json"));

// 6. Atualiza knownIssues da FR
frCurrent.reliability.knownIssues = (frCurrent.reliability.knownIssues as string[]).map(
  (issue: string) => {
    if (issue.includes("PVT") && issue.includes("UNVERIFIED")) {
      // Remove só a parte do PVT, mantém o restante (Carte Talent)
      return issue
        .replace(
          /PVT\/Working Holiday Brasil→França \(€2\.500\): UNVERIFIED, confirmar no consulado\./,
          "PVT Working Holiday Brasil→França: €2.500 confirmados via consulado francês (campanha 2026, Recife). Limite de idade: 18-30 anos. [verificado 2026-06-07]"
        )
        .trim();
    }
    return issue;
  }
);

// 7. Atualiza patch FR working-holiday-brasil
const pvtPatch = frPatch["working-holiday-brasil"];
if (pvtPatch) {
  // Corrige o limite de idade nos steps
  if (pvtPatch.process?.steps) {
    pvtPatch.process.steps = pvtPatch.process.steps.map((step: { order: number; description: string }) => ({
      ...step,
      description: step.description.replace("18-35 anos", "18-30 anos"),
    }));
  }

  // Atualiza incomeRequirement para refletir confirmação
  if (pvtPatch.requirements?.incomeRequirement) {
    pvtPatch.requirements.incomeRequirement.notes =
      "€2.500 mínimos exigidos pelo consulado francês — confirmado na campanha 2026 (Recife). " +
      "Demonstrar saldo em conta bancária no momento da solicitação. " +
      "Fonte: br.diplomatie.gouv.fr + pvtistes.net 2026.";
  }

  // Corrige notes do visto (remove referência a verificação pendente)
  if (pvtPatch.notes) {
    pvtPatch.notes = pvtPatch.notes.replace(
      "Limite de idade: 30 anos (não 35) em alguns anos — verificar condições atuais no consulado.",
      "Limite de idade: 18-30 anos (confirmado 2026 — consulado francês Recife + pvtistes.net)."
    );
  }
}

writeJson(join(CURRENT, "fr.json"), frCurrent);
writeJson(join(PATCHES, "fr.json"), frPatch);
console.log("✓ FR: PVT €2.500 confirmado; limite de idade corrigido para 18-30 anos");

console.log("\nPróximos passos:");
console.log("  bun run validate");
console.log("  bun run typecheck");
