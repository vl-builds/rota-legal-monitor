import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CountryDataSchema } from "@/extractors/schema";

const CURRENT_DIR = "data/current";

async function main(): Promise<void> {
  let files: string[];
  try {
    files = await readdir(CURRENT_DIR);
  } catch {
    console.error(`Erro: nao foi possivel ler o diretorio "${CURRENT_DIR}"`);
    process.exit(1);
  }

  const SKIP = new Set(['example.json', 'index.json'])
  const jsonFiles = files.filter((f) => f.endsWith(".json") && !SKIP.has(f));

  if (jsonFiles.length === 0) {
    console.log(`Nenhum arquivo JSON encontrado em ${CURRENT_DIR}`);
    process.exit(0);
  }

  let hasError = false;

  for (const file of jsonFiles) {
    const filePath = join(CURRENT_DIR, file);
    let json: unknown;

    try {
      const raw = await readFile(filePath, "utf-8");
      json = JSON.parse(raw);
    } catch {
      console.error(`ERRO  ${file}: falha ao ler ou fazer parse`);
      hasError = true;
      continue;
    }

    const result = CountryDataSchema.safeParse(json);

    if (result.success) {
      console.log(`OK    ${file}`);
    } else {
      console.error(`ERRO  ${file}:`);
      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? issue.path.join(".") : "(raiz)";
        console.error(`      ${path}: ${issue.message}`);
      }
      hasError = true;
    }
  }

  process.exit(hasError ? 1 : 0);
}

main();
