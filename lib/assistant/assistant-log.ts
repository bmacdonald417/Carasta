import { promises as fs } from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "reports", "assistant");
const logFile = path.join(logDir, "assistant-query-log.jsonl");

export async function appendAssistantLog(entry: Record<string, unknown>) {
  try {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Logging should never break the assistant response path.
  }
}
