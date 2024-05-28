import { all, create } from 'mathjs';
import { SpreadsheetRow } from '@/app/types/spreadsheet.types';

const math = create(all, {});

export const evaluateExpression = (
  expression: string,
  data: SpreadsheetRow[]
): string => {
  const cellRefRegex = /([A-Z])(\d+)/g;

  // using a temporary variable to store the replaced expression. (.replace() isn't destructive - it returns a new string)
  const replacedExpression = expression.replace(cellRefRegex, (_, col, row) => {
    // visually we can see headers(columns) as letters, but we need an index for furter operations.
    // ASCII code for 'A' is 65, for B it's 66 and so on. If column is 'A', then index should be 0. If column is 'B' [65-65], then index should be 1 [66-65].
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);

    // spreadsheets normally start at 1 (visually), but index needs to start at 0
    const rowIndex = parseInt(row, 10) - 1;

    // Running an o(1) lookup on the data array to get the value of the cell
    const cellValue = data[rowIndex]?.[colIndex];

    if (cellValue && cellValue.startsWith('=')) {
      // in order to evaluate a real expression, we need to remove the '=' sign and fall into the next return statement.
      // We also have to call this recursively, because we don't know how many references we have to other cells.
      return evaluateExpression(cellValue.slice(1), data);
    }

    return cellValue !== undefined ? cellValue : '0';
  });

  try {
    return math.evaluate(replacedExpression).toString();
  } catch {
    return 'ERROR';
  }
};
