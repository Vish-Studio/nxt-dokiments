export const cvListKeys = [
  "experience",
  "education",
  "skills",
  "languages",
  "certificates",
  "additional",
] as const;

export type CvListKey = (typeof cvListKeys)[number];

export type CvRow = Record<string, string>;

export interface CvListFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "level";
}

export interface CvListConfig {
  fields: CvListFieldConfig[];
  /** Field that receives legacy plain text and titles each row in summaries. */
  primaryKey: string;
  /** Row to add when the user taps "Add". */
  blankRow: CvRow;
  addLabel: string;
  /** Shown in the form title; optional sections may stay empty. */
  isOptional: boolean;
  title: string;
}

export const cvListConfigs: Record<CvListKey, CvListConfig> = {
  additional: {
    addLabel: "Add entry",
    blankRow: { description: "", period: "", subtitle: "", title: "" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "subtitle",
        label: "Details",
        placeholder: "e.g. organisation or publisher",
        type: "text",
      },
      {
        key: "period",
        label: "Period",
        placeholder: "e.g. 2019 - Present",
        type: "text",
      },
      { key: "description", label: "Description", type: "textarea" },
    ],
    isOptional: true,
    primaryKey: "title",
    title: "Custom section",
  },
  certificates: {
    addLabel: "Add certificate",
    blankRow: { issuer: "", name: "", year: "" },
    fields: [
      { key: "name", label: "Certificate", type: "text" },
      { key: "issuer", label: "Issuer", type: "text" },
      { key: "year", label: "Year", placeholder: "e.g. 2024", type: "text" },
    ],
    isOptional: true,
    primaryKey: "name",
    title: "Certificates",
  },
  education: {
    addLabel: "Add education",
    blankRow: { description: "", institution: "", period: "", title: "" },
    fields: [
      { key: "title", label: "Qualification", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      {
        key: "period",
        label: "Period",
        placeholder: "e.g. 2016 - 2019",
        type: "text",
      },
    ],
    isOptional: true,
    primaryKey: "title",
    title: "Education",
  },
  experience: {
    addLabel: "Add experience",
    blankRow: { company: "", description: "", period: "", title: "" },
    fields: [
      { key: "title", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
      {
        key: "period",
        label: "Period",
        placeholder: "e.g. 2021 - 2022",
        type: "text",
      },
      { key: "description", label: "Description", type: "textarea" },
    ],
    isOptional: false,
    primaryKey: "title",
    title: "Experience",
  },
  languages: {
    addLabel: "Add language",
    blankRow: { level: "70", name: "" },
    fields: [
      { key: "name", label: "Language", type: "text" },
      { key: "level", label: "Proficiency", type: "level" },
    ],
    isOptional: true,
    primaryKey: "name",
    title: "Languages",
  },
  skills: {
    addLabel: "Add skill",
    blankRow: { level: "70", name: "" },
    fields: [
      { key: "name", label: "Skill", type: "text" },
      { key: "level", label: "Level", type: "level" },
    ],
    isOptional: true,
    primaryKey: "name",
    title: "Skills",
  },
};

export const isCvListKey = (key: string): key is CvListKey =>
  (cvListKeys as readonly string[]).includes(key);

const prefix = "dokiments-cv-list-v1:";

/** Returns the structured rows, or null when the value is not a CV list (e.g. legacy plain text). */
export const readCvList = (value: string): CvRow[] | null => {
  if (!value.startsWith(prefix)) return null;
  try {
    const rows: unknown = JSON.parse(value.slice(prefix.length));
    return Array.isArray(rows) &&
      rows.every(
        (row) =>
          row &&
          typeof row === "object" &&
          Object.values(row).every((cell) => typeof cell === "string"),
      )
      ? (rows as CvRow[])
      : null;
  } catch {
    return null;
  }
};

export const writeCvList = (rows: CvRow[]) => prefix + JSON.stringify(rows);

/** Plain text is preserved verbatim as the primary field of a single row. */
export const cvListRows = (key: CvListKey, value: string): CvRow[] => {
  const structured = readCvList(value);
  if (structured) return structured;
  return value.trim()
    ? [
        {
          ...cvListConfigs[key].blankRow,
          [cvListConfigs[key].primaryKey]: value,
        },
      ]
    : [];
};

export const clampLevel = (level: string) => {
  const number = Number(level);
  return Number.isFinite(number)
    ? Math.min(100, Math.max(0, Math.round(number)))
    : 0;
};

/** True when no row has any visible text, so optional sections can be omitted. */
export const isCvListEmpty = (rows: CvRow[]) =>
  rows.every((row) =>
    Object.entries(row).every(([key, cell]) => key === "level" || !cell.trim()),
  );

/** Rows worth rendering: at least one text cell filled in (a default level alone does not count). */
export const visibleCvRows = (key: CvListKey, value: string): CvRow[] =>
  cvListRows(key, value).filter((row) =>
    Object.entries(row).some(
      ([cellKey, cell]) => cellKey !== "level" && cell.trim(),
    ),
  );
