'use client';

import { cn } from '@/lib/utils';
import { Status } from './status';
import { Cell } from '@/components/ui/cell';
import { LoaderCircle } from 'lucide-react';
import { create, all } from 'mathjs';
import { cva } from 'class-variance-authority';
import { SpreadsheetVariant } from '@/app/types/spreadsheet.types';
import { useSpreadsheet } from '@/app/hooks/use-spreadsheet.hook';
import { evaluateExpression } from '@/app/lib/evaluate-expression';

type SpreadsheetData = {
  headers: string[];
  rows: string[][];
};

const initialData: SpreadsheetData = {
  headers: ['A', 'B', 'C'],
  rows: [
    ['$1000', '15%', '150'],
    ['3', '=B1 * C1', '=C1 + A2'],
    ['=B1 + B2', '=B2', '=C1 + C2'],
  ],
};

const Spreadsheet = ({
  variant = 'default',
}: {
  variant?: SpreadsheetVariant;
}) => {
  const {
    data,
    headers,
    errorRows,
    statusData,
    saveMutation,
    updateCell,
    latestCsvData,
    focusedCell,
    handleCellFocus,
    handleCellBlur,
  } = useSpreadsheet({
    initialData,
  });

  const spreadsheetVariants = cva('w-full', {
    variants: {
      variant: {
        custom: 'mb-6 grid gap-px overflow-hidden rounded-lg border bg-border',
        default: 'mb-6 grid gap-y-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  const headerVariants = cva('', {
    variants: {
      variant: {
        custom: 'flex gap-x-px rounded-t-lg font-medium text-muted-foreground',
        default: 'mb-1 flex rounded-sm bg-[#EFEFEF] text-[#00000]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  const rowVariants = cva('', {
    variants: {
      variant: {
        custom: 'flex gap-x-px rounded-b-lg',
        default:
          'flex divide-x-[0.38px] divide-y-0 divide-black/30 rounded-sm border border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  const cellVariants = cva('text-center', {
    variants: {
      variant: {
        custom: '',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  return (
    <div className='mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center'>
      <div className={spreadsheetVariants({ variant })}>
        <div className={headerVariants({ variant })}>
          {headers.map((header, index) => (
            <div
              key={index}
              className={cn(
                variant === 'custom'
                  ? 'w-full bg-muted p-2 text-center'
                  : 'flex h-8 w-full items-center justify-center px-4 py-1'
              )}
            >
              {header}
            </div>
          ))}
        </div>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              rowVariants({ variant }),
              focusedCell &&
                focusedCell[0] === rowIndex &&
                variant === 'default'
                ? 'shadow-row'
                : '',
              variant === 'default' ? 'bg-[#FAFAFA]' : '',
              errorRows.has(rowIndex)
                ? variant === 'custom'
                  ? ''
                  : 'border-[#AF3434] bg-[#FFEFEF] shadow-md'
                : ''
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
                variant={variant}
                onChange={(value) => updateCell(rowIndex, colIndex, value)}
                onFocus={() => handleCellFocus(rowIndex, colIndex)}
                onBlur={handleCellBlur}
                className={cn(
                  cellVariants({ variant }),
                  variant === 'custom'
                    ? rowIndex === data.length - 1
                      ? colIndex === 0
                        ? 'rounded-bl-lg'
                        : colIndex === row.length - 1
                          ? 'rounded-br-lg'
                          : ''
                      : ''
                    : '',
                  errorRows.has(rowIndex)
                    ? variant === 'custom'
                      ? 'bg-rose-50'
                      : ''
                    : ''
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className='flex w-full items-start justify-between gap-x-4'>
        {saveMutation.status === 'pending' ||
        statusData?.status === 'IN_PROGRESS' ? (
          <div className='flex items-center justify-end gap-x-2 text-muted-foreground'>
            <LoaderCircle size={16} className='animate-spin' />
            <span className='text-sm'>saving</span>
          </div>
        ) : null}
      </div>
      <Status
        statusData={statusData}
        saveStatus={saveMutation.status}
        className='mt-6'
      />
    </div>
  );
};

export { Spreadsheet };
