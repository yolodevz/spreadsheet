import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CellProps {
  value: string;
  evaluatedValue: string;
  className?: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const Cell: React.FC<CellProps> = ({
  value,
  evaluatedValue,
  onChange,
  onFocus,
  onBlur,
  className,
}) => {
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
      className={cn(
        'w-full rounded-none border border-transparent p-2 text-right outline-none',
        'focus-within:border-px focus-within:border-blue-400',
        className
      )}
      value={editing ? inputValue : evaluatedValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

export { Cell };
