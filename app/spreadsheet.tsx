'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSave } from '@/app/mutations/save.mutation';
import { useQuery } from '@tanstack/react-query';
import { Cell } from '@/components/ui/cell';
import { cn } from '@/lib/utils';
import { Status } from './status';

const initialData = [
  ['test1', 'test2'],
  ['test3', 'test4'],
];

const headers = ['col1', 'col2'];

const fetchStatus = async ({ queryKey }: { queryKey: any }) => {
  const [, { id }] = queryKey;
  const response = await fetch(`api/get-status/${id}`);
  return response.json();
};

const useSpreadsheetLogic = () => {
  const [data, setData] = useState<string[][]>(initialData);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [statusId, setStatusId] = useState<string | undefined>(undefined);
  const [lastEditedRow, setLastEditedRow] = useState<number | undefined>(
    undefined
  );
  const [latestCsvData, setLatestCsvData] = useState<string>('');
  const [pendingSave, setPendingSave] = useState<boolean>(false);
  const saveMutation = useSave();
  const [runningTask, setRunningTask] = useState('');

  const { data: statusData } = useQuery({
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
          if (lastEditedRow != undefined) {
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

    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    setLastEditedRow(row);

    const csvData = [headers, ...newData]
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
  } = useSpreadsheetLogic();

  return (
    <div className='flex flex-col items-center p-5'>
      <div className='grid gap-1'>
        <div className='flex'>
          {headers.map((header, index) => (
            <div key={index} className='border p-2'>
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
    </div>
  );
};

export { Spreadsheet };
