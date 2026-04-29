import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
import { log } from "@/lib/log";
import { MODELS, type ModelKey } from "@/lib/models";

const SYSTEM_PROMPT =
  "Voce extrai dados oficiais de imigracao de paginas de governo. " +
  "Sua saida deve sempre vir como chamada da tool submit_extraction. " +
  "Nunca invente dados. Se um campo nao esta na pagina, use null ou array vazio. " +
  "Traduza textos para portugues brasileiro, mantendo termos tecnicos no idioma " +
  "original quando nao houver traducao consagrada. " +
  "Foque em trabalhadores assalariados ou autonomos. " +
  "Ignore vistos de estudante, investidor de alto valor, refugiado e diplomata.";

export interface ExtractionContext {
  country: string;
  countryName: string;
  contentType: string;
  sourceUrl: string;
  contentLanguage: string;
  promptHint?: string;
  model?: ModelKey;
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}

const RETRY_DELAYS_MS = [1000, 2000, 4000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUserMessage(html: string, ctx: ExtractionContext): string {
  const lines = [
    `Pais: ${ctx.countryName} (codigo ${ctx.country})`,
    `Tipo de conteudo desta pagina: ${ctx.contentType}`,
    `Idioma do conteudo: ${ctx.contentLanguage}`,
    `URL: ${ctx.sourceUrl}`,
    "",
    "Extraia os dados de imigracao relevantes para alguem que pretende trabalhar no pais.",
  ];
  if (ctx.promptHint) {
    lines.push("", ctx.promptHint);
  }
  lines.push(
    "Se um campo nao estiver disponivel, use null ou array vazio. Nao invente valores.",
    "",
    "Conteudo da pagina:",
    "",
    html,
    "",
    "Use a tool submit_extraction para retornar os dados estruturados.",
  );
  return lines.join("\n");
}

export async function extractFromHtml<T>(
  html: string,
  schema: z.ZodType<T>,
  context: ExtractionContext,
): Promise<T> {
  const client = new Anthropic();

  const rawSchema = zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;
  delete rawSchema["$schema"];

  const tool: Anthropic.Messages.Tool = {
    name: "submit_extraction",
    description: "Retorna os dados estruturados de imigracao extraidos da pagina.",
    input_schema: rawSchema as Anthropic.Messages.Tool["input_schema"],
  };

  const selectedModel = MODELS[context.model ?? "haiku"];
  const userContent = buildUserMessage(html, context);
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      log.debug("chamando LLM", {
        attempt,
        country: context.country,
        url: context.sourceUrl,
        model: selectedModel,
        htmlChars: html.length,
      });

      const message = await client.messages.create({
        model: selectedModel,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        tools: [tool],
        tool_choice: { type: "tool", name: "submit_extraction" },
        messages: [{ role: "user", content: userContent }],
      });

      const usage = message.usage;
      const cacheReadTokens =
        (usage as unknown as Record<string, unknown>)["cache_read_input_tokens"] ?? 0;

      const toolBlock = message.content.find(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
      );

      if (!toolBlock) {
        throw new ExtractionError("LLM nao chamou a tool submit_extraction");
      }

      const result = schema.safeParse(toolBlock.input);
      if (!result.success) {
        const issues = result.error.issues
          .map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`)
          .join("; ");
        throw new ExtractionError(`Schema invalido apos extracao: ${issues}`);
      }

      log.info("extracao concluida", {
        country: context.country,
        url: context.sourceUrl,
        model: selectedModel,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens,
        attempt,
      });

      return result.data;
    } catch (err) {
      lastError = err;

      if (attempt === RETRY_DELAYS_MS.length) break;

      const delayMs = RETRY_DELAYS_MS[attempt] ?? 4000;

      if (err instanceof Anthropic.RateLimitError) {
        log.warn("rate limit atingido", { attempt, nextDelayMs: delayMs * 10 });
        await sleep(delayMs * 10);
      } else if (err instanceof ExtractionError) {
        log.warn("extracao invalida, tentando novamente", {
          attempt,
          error: err.message,
          nextDelayMs: delayMs,
        });
        await sleep(delayMs);
      } else if (err instanceof Anthropic.APIError) {
        log.warn("erro da API Anthropic", {
          attempt,
          status: err.status,
          message: err.message,
          nextDelayMs: delayMs,
        });
        await sleep(delayMs);
      } else {
        log.warn("erro inesperado", {
          attempt,
          error: String(err),
          nextDelayMs: delayMs,
        });
        await sleep(delayMs);
      }
    }
  }

  throw new ExtractionError(
    `Extracao falhou apos ${RETRY_DELAYS_MS.length + 1} tentativas`,
    lastError,
  );
}
