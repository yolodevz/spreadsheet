import { useCallback, useEffect, useState } from 'react';
import { useSave } from '@/app/mutations/save.mutation';
import { SpreadsheetData, SpreadsheetRow } from '@/app/types/spreadsheet.types';
import { evaluateExpression } from '@/app/lib/evaluate-expression';
import { useFetchStatus } from '@/app/queries/get-status.query';

const useSpreadsheet = ({ initialData }: { initialData: SpreadsheetData }) => {
  const [data, setData] = useState<SpreadsheetRow[]>(initialData.rows);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [statusId, setStatusId] = useState<string | undefined>(undefined);
  const [lastEditedRow, setLastEditedRow] = useState<number | undefined>(
    undefined
  );
  const [latestCsvData, setLatestCsvData] = useState<string>('');
  const [pendingSave, setPendingSave] = useState<boolean>(false);
  const [runningTask, setRunningTask] = useState<string>('');
  const [focusedCell, setFocusedCell] = useState<[number, number] | undefined>(
    undefined
  );

  const saveMutation = useSave();
  const { statusData } = useFetchStatus({ statusId });

  const handleSave = useCallback((): void => {
    const file = new File([latestCsvData], 'data.csv', { type: 'text/csv' });
    saveMutation.mutate(
      { payload: { file } },
      {
        onSuccess: (data) => {
          setStatusId(data.id);
          setPendingSave(false);
        },
        onError: () => {
          if (lastEditedRow !== undefined) {
            setErrorRows((prev) => new Set(prev).add(lastEditedRow));
          }
          setPendingSave(false);
        },
      }
    );
  }, [latestCsvData, lastEditedRow, saveMutation]);

  useEffect(() => {
    if (
      saveMutation.status !== 'pending' &&
      statusData?.status !== 'IN_PROGRESS' &&
      pendingSave
    ) {
      handleSave();
      setRunningTask(latestCsvData);
    }
  }, [
    saveMutation.status,
    statusData?.status,
    pendingSave,
    handleSave,
    latestCsvData,
  ]);

  const updateCell = (row: number, col: number, value: string) => {
    setErrorRows(new Set());

    if (data[row][col] === value) return;

    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    setLastEditedRow(row);

    const evaluatedData = newData.map((row, rowIndex) =>
      row.map((cell) =>
        cell.startsWith('=') ? evaluateExpression(cell.slice(1), newData) : cell
      )
    );

    const csvData = [initialData.headers, ...evaluatedData]
      .map((row) => row.join(','))
      .join('\n');
    setLatestCsvData(csvData);
    setPendingSave(true);
  };

  const handleCellFocus = (row: number, col: number) => {
    setFocusedCell([row, col]);
  };

  const handleCellBlur = () => {
    setFocusedCell(undefined);
  };

  return {
    data,
    headers: initialData.headers,
    errorRows,
    statusData,
    saveMutation,
    updateCell,
    latestCsvData,
    runningTask,
    pendingSave,
    focusedCell,
    handleCellFocus,
    handleCellBlur,
  };
};

export { useSpreadsheet };
