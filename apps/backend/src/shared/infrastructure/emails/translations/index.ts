import en from "./en.json" with { type: "json" };
import es from "./es.json" with { type: "json" };
import ca from "./ca.json" with { type: "json" };

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
