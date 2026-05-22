import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { log } from "@/lib/log";

interface Credential {
  email: string;
  nome: string;
  salt: string;
  hash: string;
  addedAt: string;
  revokedAt?: string;
}

interface CredentialsFile {
  version: 1;
  credentials: Credential[];
}

const CRED_PATH = resolve(process.cwd(), "previews/area-aluno/credentials.json");

function parseArgs(argv: string[]): { email: string } {
  const args = argv.slice(2);
  const emailIdx = args.findIndex((a) => a === "--email");
  if (emailIdx === -1 || !args[emailIdx + 1]) {
    console.error("Uso: bun run alunos:revogar -- --email joao@exemplo.com");
    process.exit(1);
  }
  return { email: args[emailIdx + 1]!.trim().toLowerCase() };
}

async function main(): Promise<void> {
  const { email } = parseArgs(process.argv);
  const raw = await readFile(CRED_PATH, "utf8");
  const file = JSON.parse(raw) as CredentialsFile;

  const cred = file.credentials.find((c) => c.email === email && !c.revokedAt);
  if (!cred) {
    log.error("Credencial ativa nao encontrada.", { email });
    process.exit(1);
  }

  cred.revokedAt = new Date().toISOString();
  await writeFile(CRED_PATH, JSON.stringify(file, null, 2) + "\n", "utf8");
  log.info("Credencial revogada.", { email });
  console.log(`\nCredencial de ${email} revogada. Comite o JSON atualizado.\n`);
}

main().catch((err) => {
  log.error("Falha ao revogar credencial.", { error: String(err) });
  process.exit(1);
});
