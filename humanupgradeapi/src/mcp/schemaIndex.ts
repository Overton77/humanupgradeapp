import { readFileSync } from "node:fs";

type SchemaSource = "graphql" | "prisma";

export type SchemaSearchInput = {
  query: string;
  sources?: SchemaSource[];
  entityTypes?: string[];
  limit?: number;
};

type SchemaSection = {
  source: SchemaSource;
  name: string;
  kind: string;
  startLine: number;
  endLine: number;
  text: string;
};

const GRAPHQL_SCHEMA_PATH = new URL("../graphql/schema.graphql", import.meta.url);
const PRISMA_SCHEMA_PATH = new URL("../../prisma/schema.prisma", import.meta.url);

const SECTION_STARTERS = {
  graphql: /^(type|input|enum|interface|union|scalar)\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
  prisma: /^(model|enum|type|generator|datasource)\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
} satisfies Record<SchemaSource, RegExp>;

let cachedSections: SchemaSection[] | undefined;

function splitSections(
  source: SchemaSource,
  path: URL,
  starter: RegExp,
): SchemaSection[] {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const sections: SchemaSection[] = [];
  let current:
    | {
        kind: string;
        name: string;
        startLine: number;
        lines: string[];
      }
    | undefined;

  for (const [index, line] of lines.entries()) {
    const match = line.match(starter);

    if (match) {
      if (current) {
        sections.push({
          source,
          kind: current.kind,
          name: current.name,
          startLine: current.startLine,
          endLine: index,
          text: current.lines.join("\n"),
        });
      }

      current = {
        kind: match[1],
        name: match[2],
        startLine: index + 1,
        lines: [line],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    sections.push({
      source,
      kind: current.kind,
      name: current.name,
      startLine: current.startLine,
      endLine: lines.length,
      text: current.lines.join("\n"),
    });
  }

  return sections;
}

function getSections() {
  cachedSections ??= [
    ...splitSections("graphql", GRAPHQL_SCHEMA_PATH, SECTION_STARTERS.graphql),
    ...splitSections("prisma", PRISMA_SCHEMA_PATH, SECTION_STARTERS.prisma),
  ];

  return cachedSections;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[_\s-]+/g, "");
}

function scoreSection(
  section: SchemaSection,
  queryTerms: string[],
  entityTerms: string[],
) {
  const name = normalize(section.name);
  const haystack = normalize(`${section.kind} ${section.name}\n${section.text}`);
  let score = 0;

  for (const term of queryTerms) {
    if (!term) continue;
    if (name === term) score += 10;
    if (name.includes(term)) score += 5;
    if (haystack.includes(term)) score += 2;
  }

  for (const entityTerm of entityTerms) {
    if (!entityTerm) continue;
    if (name.includes(entityTerm)) score += 8;
    if (haystack.includes(entityTerm)) score += 2;
  }

  return score;
}

export function searchSchemaIndex(input: SchemaSearchInput) {
  const query = input.query.trim();
  const sources = new Set(input.sources?.length ? input.sources : ["graphql", "prisma"]);
  const limit = Math.max(1, Math.min(input.limit ?? 8, 20));
  const queryTerms = query.split(/\s+/).map(normalize).filter(Boolean);
  const entityTerms = (input.entityTypes ?? []).map(normalize).filter(Boolean);

  const matches = getSections()
    .filter((section) => sources.has(section.source))
    .map((section) => ({
      section,
      score: scoreSection(section, queryTerms, entityTerms),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ section, score }) => ({
      source: section.source,
      kind: section.kind,
      name: section.name,
      startLine: section.startLine,
      endLine: section.endLine,
      score,
      excerpt: section.text.length > 4000
        ? `${section.text.slice(0, 4000)}\n...`
        : section.text,
    }));

  return {
    query,
    sources: Array.from(sources),
    entityTypes: input.entityTypes ?? [],
    matches,
  };
}
