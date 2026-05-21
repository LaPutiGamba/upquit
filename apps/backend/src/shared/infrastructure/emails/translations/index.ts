import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const en = require("./en.json") as Record<string, Record<string, string>>;
const es = require("./es.json") as Record<string, Record<string, string>>;
const ca = require("./ca.json") as Record<string, Record<string, string>>;

const translations: Record<string, Record<string, Record<string, string>>> = { en, es, ca };

function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
}

export function t(locale: string, namespace: string, key: string, variables?: Record<string, string>): string {
  const value = translations[locale]?.[namespace]?.[key];
  if (!value) {
    const fallback = translations["en"]?.[namespace]?.[key];
    if (!fallback) return `{${namespace}.${key}}`;
    return variables ? interpolate(fallback, variables) : fallback;
  }
  return variables ? interpolate(value, variables) : value;
}
