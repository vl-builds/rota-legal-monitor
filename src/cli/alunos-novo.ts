import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, createHash } from "node:crypto";
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

function parseArgs(argv: string[]): { nome: string; email: string } {
  const args = argv.slice(2);
  const nomeIdx = args.findIndex((a) => a === "--nome");
  const emailIdx = args.findIndex((a) => a === "--email");

  if (nomeIdx === -1 || emailIdx === -1 || !args[nomeIdx + 1] || !args[emailIdx + 1]) {
    console.error("Uso: bun run alunos:novo -- --nome \"Joao Silva\" --email joao@exemplo.com");
    process.exit(1);
  }

  return {
    nome: args[nomeIdx + 1]!.trim(),
    email: args[emailIdx + 1]!.trim().toLowerCase(),
  };
}

function generatePassword(length = 16): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

async function loadCreds(): Promise<CredentialsFile> {
  try {
    const raw = await readFile(CRED_PATH, "utf8");
    const parsed = JSON.parse(raw) as CredentialsFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.credentials)) {
      throw new Error("Arquivo de credenciais corrompido.");
    }
    return parsed;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: 1, credentials: [] };
    }
    throw err;
  }
}

async function saveCreds(file: CredentialsFile): Promise<void> {
  await writeFile(CRED_PATH, JSON.stringify(file, null, 2) + "\n", "utf8");
}

const DEPRECADO =
  "[DEPRECADO] As credenciais agora vivem no D1 (Cloudflare), geridas pelo painel admin em /area-admin/. Este CLI escreve em credentials.json, que NAO e mais lido pelo login.";

async function main(): Promise<void> {
  console.warn(DEPRECADO);
  const { nome, email } = parseArgs(process.argv);
  const creds = await loadCreds();

  const existing = creds.credentials.find((c) => c.email === email && !c.revokedAt);
  if (existing) {
    log.error("Email ja possui credencial ativa.", { email });
    console.error("\nUse outro email ou revogue a credencial atual primeiro.");
    process.exit(1);
  }

  const password = generatePassword(16);
  const salt = randomBytes(16).toString("hex");
  const hash = sha256(salt + password);

  creds.credentials.push({
    email,
    nome,
    salt,
    hash,
    addedAt: new Date().toISOString(),
  });

  await saveCreds(creds);

  log.info("Credencial criada.", { email, nome });
  console.log("\n=== CREDENCIAL DO ALUNO ===");
  console.log(`Nome:  ${nome}`);
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);
  console.log("===========================");
  console.log("\nEnvie estas credenciais por DM no Discord para o aluno.");
  console.log("A senha NAO sera mostrada novamente. Comite o JSON atualizado.\n");
}

main().catch((err) => {
  log.error("Falha ao criar credencial.", { error: String(err) });
  process.exit(1);
});
