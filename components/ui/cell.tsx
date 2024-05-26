import React from 'react';

interface CellProps {
  value: string;
  onChange: (value: string) => void;
}

const Cell: React.FC<CellProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = React.useState(value);

  const handleBlur = () => {
    onChange(inputValue);
  };

  return (
    <input
      className='h-8 w-24 border border-gray-300 p-1 text-right'
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
};

export { Cell };
