import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { CountryDataSchema } from "@/extractors/schema";

function loadExample(): unknown {
  const raw = readFileSync("data/current/example.json", "utf-8");
  return JSON.parse(raw);
}

describe("CountryDataSchema", () => {
  it("valida o example.json sem erros", () => {
    const result = CountryDataSchema.safeParse(loadExample());
    if (!result.success) {
      console.error(JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it("rejeita quando campo obrigatorio esta ausente", () => {
    const json = loadExample() as Record<string, unknown>;
    delete json["forBrazilians"];
    const result = CountryDataSchema.safeParse(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => String(i.path[0]));
      expect(paths).toContain("forBrazilians");
    }
  });

  it("rejeita visaTypes vazio quando workPermitNeeded e true", () => {
    const json = loadExample() as Record<string, unknown>;
    (json["forBrazilians"] as Record<string, unknown>)["workPermitNeeded"] = true;
    json["visaTypes"] = [];
    const result = CountryDataSchema.safeParse(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("workPermitNeeded"))).toBe(true);
    }
  });

  it("rejeita MoneyAmount com amount negativo, mas aceita zero (gratuito)", () => {
    const base = loadExample() as Record<string, unknown>;
    const visaTypes = base["visaTypes"] as Array<Record<string, unknown>>;
    const setAmount = (json: Record<string, unknown>, value: number) => {
      const vts = json["visaTypes"] as Array<Record<string, unknown>>;
      const first = vts[0];
      if (first !== undefined) {
        const req = first["requirements"] as Record<string, unknown>;
        const income = req["incomeRequirement"] as Record<string, unknown>;
        income["amount"] = value;
      }
    };

    // negativo: rejeitado
    const negative = structuredClone(base);
    setAmount(negative, -1);
    expect(CountryDataSchema.safeParse(negative).success).toBe(false);

    // zero: valido (ex: taxa gratuita), desde que visaTypes[0] exista com incomeRequirement
    if (visaTypes[0] !== undefined) {
      const zero = structuredClone(base);
      setAmount(zero, 0);
      expect(CountryDataSchema.safeParse(zero).success).toBe(true);
    }
  });

  it("rejeita recentChanges em ordem ascendente", () => {
    const json = loadExample() as Record<string, unknown>;
    json["recentChanges"] = [
      {
        date: "2025-06-01",
        title: "Mudanca antiga",
        summary: "Resumo",
        severity: "minor",
        affects: [],
        sourceUrl: "https://example.com",
      },
      {
        date: "2026-01-01",
        title: "Mudanca recente",
        summary: "Resumo",
        severity: "major",
        affects: [],
        sourceUrl: "https://example.com",
      },
    ];
    const result = CountryDataSchema.safeParse(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("decrescente"))).toBe(true);
    }
  });

  it("rejeita meta.lastUpdated no futuro", () => {
    const json = loadExample() as Record<string, unknown>;
    const meta = json["meta"] as Record<string, unknown>;
    meta["lastUpdated"] = "2099-01-01T00:00:00Z";
    const result = CountryDataSchema.safeParse(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("futuro"))).toBe(true);
    }
  });

  it("rejeita process.steps com gap na sequencia", () => {
    const json = loadExample() as Record<string, unknown>;
    const visaTypes = json["visaTypes"] as Array<Record<string, unknown>>;
    const first = visaTypes[0];
    if (first !== undefined) {
      const process = first["process"] as Record<string, unknown>;
      process["steps"] = [
        { order: 1, name: "Passo 1", description: "Desc", estimatedDays: null },
        { order: 3, name: "Passo 3", description: "Desc", estimatedDays: null },
      ];
    }
    const result = CountryDataSchema.safeParse(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("sequencial"))).toBe(true);
    }
  });
});
