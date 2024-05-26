import React, { useState, useEffect } from 'react';

interface CellProps {
  value: string;
  evaluatedValue: string;
  onChange: (value: string) => void;
}

const Cell: React.FC<CellProps> = ({ value, evaluatedValue, onChange }) => {
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
  };

  const handleFocus = () => {
    setEditing(true);
  };

  return (
    <input
      className='h-8 w-24 border border-gray-300 p-1 text-right'
      value={editing ? inputValue : evaluatedValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

export { Cell };
