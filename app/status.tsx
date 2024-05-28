import React from 'react';
import { cn } from '@/lib/utils';
import { SuccessResponse } from '@/app/api/types/api.types';

interface StatusDisplayProps {
  statusData?: SuccessResponse;
  saveStatus: string;
  className?: string;
}

const Status = ({ statusData, saveStatus, className }: StatusDisplayProps) => {
  return (
    <div className={cn('flex w-full flex-col space-y-2', className)}>
      <pre>
        <code>{JSON.stringify(statusData, null, 2)}</code>
      </pre>
      <div>Mutation Status: {saveStatus}</div>
      <div>Mutation ID: {statusData?.id}</div>
    </div>
  );
};

export { Status };
