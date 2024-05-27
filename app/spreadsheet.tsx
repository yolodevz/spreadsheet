'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSave } from '@/app/mutations/save.mutation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Status } from './status';
import { Button } from '@/components/ui/button';
import { Cell } from '@/components/ui/cell';
import { LoaderCircle } from 'lucide-react';
import { SuccessResponse } from '@/app/api/save/route';
import { create, all } from 'mathjs';

const math = create(all, {});

type SpreadsheetData = string[][];

const initialData: SpreadsheetData = [
  ['$1000', '15%', '150'],
  ['3', '=B1 * C1', '=C1 + A2'],
  ['=B1 + B2', '=B2', '=C1 + C2'],
];

const headers = ['A', 'B', 'C'];

const fetchStatus = async ({ queryKey }: { queryKey: any }) => {
  const [, { id }] = queryKey;
  const response = await fetch(`api/get-status/${id}`);
  return response.json();
};

const evaluateExpression = (
  expression: string,
  data: SpreadsheetData
): string => {
  const cellRefRegex = /([A-Z]+)(\d+)/g;

  const replacedExpression = expression.replace(cellRefRegex, (_, col, row) => {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);
    const rowIndex = parseInt(row, 10) - 1;
    const cellValue = data[rowIndex]?.[colIndex];
    if (cellValue && cellValue.startsWith('=')) {
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

const getReferencedCells = (expression: string): [number, number][] => {
  const cellRefRegex = /([A-Z]+)(\d+)/g;
  let match;
  const references: [number, number][] = [];

  while ((match = cellRefRegex.exec(expression)) !== null) {
    const colIndex = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
    const rowIndex = parseInt(match[2], 10) - 1;
    references.push([rowIndex, colIndex]);
  }

  return references;
};

const useSpreadsheetLogic = () => {
  const [data, setData] = useState<SpreadsheetData>(initialData);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [statusId, setStatusId] = useState<string | undefined>(undefined);
  const [lastEditedRow, setLastEditedRow] = useState<number | undefined>(
    undefined
  );
  const [latestCsvData, setLatestCsvData] = useState<string>('');
  const [pendingSave, setPendingSave] = useState<boolean>(false);
  const [runningTask, setRunningTask] = useState<string>('');
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);

  const [allowedSave, setAllowedSave] = useState<boolean>(true);

  const saveMutation = useSave();

  const { data: statusData } = useQuery<SuccessResponse>({
    queryKey: ['status', { id: statusId }],
    queryFn: fetchStatus,
    enabled: !!statusId,
  });

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
    if (!allowedSave) return;

    if (
      saveMutation.status !== 'pending' &&
      statusData?.status !== 'IN_PROGRESS' &&
      pendingSave
    ) {
      handleSave();
      setRunningTask(latestCsvData);
    }
  }, [
    allowedSave,
    saveMutation.status,
    statusData?.status,
    pendingSave,
    handleSave,
    latestCsvData,
  ]);

  const updateCell = (row: number, col: number, value: string) => {
    setErrorRows(new Set());

    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    setLastEditedRow(row);

    const evaluatedData = newData.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        cell.startsWith('=') ? evaluateExpression(cell.slice(1), newData) : cell
      )
    );

    const csvData = [headers, ...evaluatedData]
      .map((row) => row.join(','))
      .join('\n');
    setLatestCsvData(csvData);
    setPendingSave(true);
  };

  const handleCellFocus = (row: number, col: number) => {
    setFocusedCell([row, col]);
  };

  const handleCellBlur = () => {
    setFocusedCell(null);
  };

  return {
    data,
    errorRows,
    statusData,
    saveMutation,
    updateCell,
    latestCsvData,
    runningTask,
    pendingSave,
    allowedSave,
    focusedCell,
    handleCellFocus,
    handleCellBlur,
  };
};

const Spreadsheet: React.FC = () => {
  const {
    data,
    errorRows,
    statusData,
    saveMutation,
    updateCell,
    latestCsvData,
    runningTask,
    allowedSave,
    focusedCell,
    handleCellFocus,
    handleCellBlur,
  } = useSpreadsheetLogic();

  const getHighlightClass = (rowIndex: number, colIndex: number) => {
    if (focusedCell) {
      const [focusedRow, focusedCol] = focusedCell;
      const expression = data[focusedRow]?.[focusedCol];
      if (expression && expression.startsWith('=')) {
        const references = getReferencedCells(expression.slice(1));
        if (references.some(([r, c]) => r === rowIndex && c === colIndex)) {
          return 'bg-amber-50';
        }
      }
    }
    return '';
  };

  return (
    <div className='mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center'>
      <div className='space-y-6'>
        <div className='mb-6 grid gap-px overflow-hidden rounded-lg border bg-border'>
          <div className='flex gap-x-px rounded-t-lg font-medium text-muted-foreground'>
            {headers.map((header, index) => (
              <div key={index} className='w-full bg-muted p-2 text-center'>
                {header}
              </div>
            ))}
          </div>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className={'flex gap-x-px rounded-b-lg'}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={colIndex}
                  value={cell}
                  evaluatedValue={
                    cell.startsWith('=')
                      ? evaluateExpression(cell.slice(1), data)
                      : cell
                  }
                  onChange={(value) => updateCell(rowIndex, colIndex, value)}
                  onFocus={() => handleCellFocus(rowIndex, colIndex)}
                  onBlur={handleCellBlur}
                  className={cn(
                    errorRows.has(rowIndex) ? 'bg-rose-50' : '',
                    rowIndex === data.length - 1
                      ? colIndex === 0
                        ? 'rounded-bl-lg'
                        : colIndex === row.length - 1
                          ? 'rounded-br-lg'
                          : ''
                      : '',
                    getHighlightClass(rowIndex, colIndex)
                  )}
                />
              ))}
            </div>
          ))}
        </div>
        <div className='flex items-start justify-between gap-x-4'>
          <Button asChild variant='secondary'>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(latestCsvData)}`}
              download='data.csv'
            >
              Download CSV
            </a>
          </Button>
          {saveMutation.status === 'pending' ||
          statusData?.status === 'IN_PROGRESS' ? (
            <div className='flex items-center justify-end gap-x-2 text-muted-foreground'>
              <LoaderCircle size={16} className='animate-spin' />
              <span className='text-sm'>saving</span>
            </div>
          ) : null}
        </div>
        <Status statusData={statusData} saveStatus={saveMutation.status} />
        {(statusData?.status === 'IN_PROGRESS' ||
          saveMutation.status === 'pending') && (
          <>
            <div>runningTask: {runningTask}</div>
            {JSON.stringify(runningTask) !== JSON.stringify(latestCsvData) && (
              <div>scheduledTask: {latestCsvData}</div>
            )}
          </>
        )}
        <div>most recently saved: {latestCsvData}</div>
        <p>allowed save: {`${allowedSave}`}</p>
      </div>
    </div>
  );
};

export { Spreadsheet };
