import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { SpreadsheetVariant } from '@/app/types/spreadsheet.types';

interface CellProps {
  value: string;
  evaluatedValue: string;
  className?: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  variant?: SpreadsheetVariant;
}

const cellVariants = cva(
  [
    'w-full rounded-none border border-transparent p-2 text-right outline-none',
    'focus-within:border-px focus-within:border-blue-400',
  ],
  {
    variants: {
      variant: {
        custom: 'focus-within:border-blue-400',
        default:
          'focus-within:border-[#CBDCFF] focus-within:shadow-sm bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Cell = ({
  value,
  evaluatedValue,
  onChange,
  onFocus,
  onBlur,
  className,
  variant = 'default',
}: CellProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setInputValue(value);
    }
  }, [value, editing]);

  const handleBlur = () => {
    setEditing(false);
    onChange(inputValue);
    onBlur();
  };

  const handleFocus = () => {
    setEditing(true);
    onFocus();
  };

  return (
    <input
      className={cn(cellVariants({ variant }), className)}
      value={editing ? inputValue : evaluatedValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

export { Cell };
