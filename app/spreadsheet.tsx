'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSave } from '@/app/mutations/save.mutation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Status } from './status';
import { Cell } from '@/components/ui/cell';
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

  const [allowedSave, setAllowedSave] = useState<boolean>(false);

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
    pendingSave,
    allowedSave,
  } = useSpreadsheetLogic();

  return (
    <div className='flex flex-col items-center p-5'>
      <div className='grid gap-1'>
        <div className='flex'>
          {headers.map((header, index) => (
            <div key={index} className='w-full border p-2'>
              {header}
            </div>
          ))}
        </div>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              errorRows.has(rowIndex) ? 'border border-red-400' : ''
            )}
          >
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
              />
            ))}
          </div>
        ))}
      </div>
      <a
        href={`data:text/csv;charset=utf-8,${encodeURIComponent(latestCsvData)}`}
        download='data.csv'
      >
        Download CSV
      </a>
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
  );
};

export { Spreadsheet };
