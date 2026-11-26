/**
 * Adds a fresh VAPID key pair to `.env.local` without changing other settings.
 *
 * Existing configured keys are never replaced: rotation invalidates browser
 * subscriptions. Blank key entries are filled, while a partial or duplicate
 * pair causes the script to stop without writing the file.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webPush = createRequire(import.meta.url)("web-push");

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env.local");
const keyNames = ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"];

/**
 * Adds generated VAPID keys to missing or blank entries in an env file.
 *
 * @param content - Existing env file contents.
 * @param keys - A fresh pair returned by `web-push`.
 * @returns Updated contents with unrelated lines preserved.
 * @throws If either key is already configured, the pair is incomplete, or a
 * key is declared more than once.
 */
export const addVapidKeys = (content, keys) => {
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content === "" ? [] : content.split(/\r\n|\n/);
  const entries = new Map(keyNames.map((name) => [name, []]));
  const assignmentPattern = /^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.*)$/;

  for (const line of lines) {
    const match = line.match(assignmentPattern);
    if (match && entries.has(match[1])) {
      entries.get(match[1]).push(match[2]);
    }
  }

  for (const name of keyNames) {
    if (entries.get(name).length > 1) {
      throw new Error(`Found duplicate ${name} entries in .env.local.`);
    }
  }

  const configured = keyNames.map((name) => {
    const value = entries.get(name)[0];
    if (value === undefined) return false;

    const normalized = value.replace(/\s+#.*$/, "").trim();
    return normalized !== "" && normalized !== '""' && normalized !== "''";
  });

  if (configured.every(Boolean)) {
    throw new Error(
      "VAPID keys already exist in .env.local; refusing to replace them.",
    );
  }
  if (configured.some(Boolean)) {
    throw new Error(
      "A VAPID key is already configured without its pair; refusing to change .env.local.",
    );
  }

  if (!keys.publicKey || !keys.privateKey) {
    throw new Error("Key generation returned an incomplete VAPID key pair.");
  }

  const values = {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: keys.publicKey,
    VAPID_PRIVATE_KEY: keys.privateKey,
  };
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const match = lines[index].match(assignmentPattern);
    if (!match || !entries.has(match[1])) continue;

    const name = match[1];
    lines[index] =
      `${lines[index].slice(0, lines[index].indexOf("=") + 1)}${values[name]}`;
  }

  const missing = keyNames.filter((name) => entries.get(name).length === 0);
  if (content.endsWith("\n")) lines.pop();
  for (const name of missing) {
    lines.push(`${name}=${values[name]}`);
  }

  const result = lines.join(newline);
  return content.endsWith("\n") || missing.length > 0
    ? `${result}${newline}`
    : result;
};

const main = () => {
  const keys = webPush.generateVAPIDKeys();
  const exists = fs.existsSync(envPath);
  const content = exists ? fs.readFileSync(envPath, "utf8") : "";
  const updated = addVapidKeys(content, keys);

  fs.writeFileSync(envPath, updated, exists ? undefined : { mode: 0o600 });
  console.log(
    "Saved VAPID keys to .env.local. The private key was not displayed.",
  );
};

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Could not set up VAPID keys.",
    );
    process.exitCode = 1;
  }
}
