// Converte string para bytes com buffer ArrayBuffer concreto.
// TextEncoder.encode() devolve Uint8Array<ArrayBufferLike>, que o TS 5.7 nao
// aceita como BufferSource no Web Crypto. Reembrulhar fixa o tipo do buffer.
export function utf8(s: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(s))
}
