import { createHash } from "crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function stableJsonHash(value: unknown): string {
  return sha256Hex(JSON.stringify(value));
}
