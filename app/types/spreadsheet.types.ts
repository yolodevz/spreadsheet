type SpreadsheetVariant = 'custom' | 'default';

type SpreadsheetRow = string[];

type SpreadsheetData = {
  headers: string[];
  rows: SpreadsheetRow[];
};

export type { SpreadsheetVariant, SpreadsheetData, SpreadsheetRow };
