'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSave } from '@/app/mutations/save.mutation';
import { Button } from '@/components/ui/button';
import { SuccessResponse } from '@/app/api/save/route';

const isButtonDisabled = (
  saveStatus: string,
  statusResponse?: SuccessResponse
): boolean => {
  return saveStatus === 'pending' || statusResponse?.status === 'IN_PROGRESS';
};

export const fetchStatus = async ({ queryKey }: { queryKey: any }) => {
  const [, { id }] = queryKey;
  const response = await fetch(`api/get-status/${id}`);
  return response.json();
};

const convertToCSV = (data: any[]): string => {
  return data.map((row) => Object.values(row).join(',')).join('\n');
};

export function Posts() {
  const [statusId, setStatusId] = React.useState<string | undefined>(undefined);

  const { data: statusData } = useQuery<SuccessResponse>({
    queryKey: ['status', { id: statusId }],
  });

  const sampleData = [
    { id: 1, title: 'title1', body: 'body1' },
    { id: 2, title: 'title2', body: 'body2' },
  ];

  const saveMutation = useSave();

  const handleSave = (file: File): void => {
    saveMutation.mutate(
      { payload: { file } },
      {
        onSuccess: (data) => {
          console.log('Save successful:', data);
          setStatusId(data.id);
        },
        onError: (error: { message: string }) => {
          console.error('Save error:', error.message);
        },
      }
    );
  };

  const csvData = convertToCSV(sampleData);

  const onSaveClick = () => {
    const file = new File([csvData], 'data.csv', { type: 'text/csv' });
    console.log('file', file);
    handleSave(file);
  };

  return (
    <div>
      <Button
        onClick={onSaveClick}
        disabled={isButtonDisabled(saveMutation.status, statusData)}
      >
        Save
      </Button>

      {/*// link to download the file generated*/}
      <a href={`data:text/csv;charset=utf-8,${csvData}`} download='data.csv'>
        down
      </a>

      <div>Status ID: {statusData?.id}</div>
      <pre>{JSON.stringify(statusData, null, 2)}</pre>
      <div>Mutation Status: {saveMutation.status}</div>
      <div>Mutation ID: {saveMutation.data?.id}</div>
    </div>
  );
}
