'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Spreadsheet } from '@/app/spreadsheet';
import { SpreadsheetVariant } from '@/app/types/spreadsheet.types';

function SpreadsheetPage() {
  const [variant, setVariant] = useState<SpreadsheetVariant>('default');

  return (
    <>
      <div className='ml-auto flex items-center space-x-2 p-6'>
        <Switch
          id='theme'
          onCheckedChange={() => {
            setVariant(variant === 'default' ? 'custom' : 'default');
          }}
        />
        <Label htmlFor='theme'>Custom theme</Label>
      </div>
      <Spreadsheet variant={variant} />
    </>
  );
}

export default SpreadsheetPage;
