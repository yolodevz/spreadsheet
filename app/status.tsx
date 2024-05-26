import React from 'react';
import { SuccessResponse } from '@/app/api/save/route';

interface StatusDisplayProps {
  statusData?: SuccessResponse;
  saveStatus: string;
}

const Status: React.FC<StatusDisplayProps> = ({ statusData, saveStatus }) => {
  return (
    <div>
      <div>Status ID: {statusData?.id}</div>
      <pre>{JSON.stringify(statusData, null, 2)}</pre>
      <div>Mutation Status: {saveStatus}</div>
      <div>Mutation ID: {statusData?.id}</div>
    </div>
  );
};

export { Status };
