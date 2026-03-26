interface CsvColumnConfig {
  name: string;
  validate?: (value: string, lineNum: number) => string | null;
}

export function parseCSV<T>(
  text: string,
  columns: CsvColumnConfig[],
  rowBuilder: (fields: string[]) => T,
): { data: T[]; error: string | null } {
  const lines = text.trim().split("\n");
  const rows: T[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < columns.length) {
      const expected = columns.map((c) => c.name).join(",");
      return {
        data: [],
        error: `Line ${i + 1} is invalid: expected ${expected}`,
      };
    }

    for (let col = 0; col < columns.length; col++) {
      const value = parts[col].trim();
      if (!value) {
        return {
          data: [],
          error: `Line ${i + 1} is missing ${columns[col].name}`,
        };
      }
      if (columns[col].validate) {
        const validationError = columns[col].validate!(value, i + 1);
        if (validationError) {
          return { data: [], error: validationError };
        }
      }
    }

    rows.push(rowBuilder(parts.map((p) => p.trim())));
  }

  if (rows.length === 0) {
    return { data: [], error: "No valid rows found in CSV" };
  }

  return { data: rows, error: null };
}
