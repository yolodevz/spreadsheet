import wretch from 'wretch';
import { useQuery } from '@tanstack/react-query';
import { SuccessResponse } from '@/app/api/types/api.types';

const fetchStatus = async ({ queryKey }: { queryKey: any }) => {
  const [, { id }] = queryKey;

  return await wretch()
    .url(`api/get-status/${id}`)
    .get()
    .json<SuccessResponse>();
};

const useFetchStatus = ({ statusId }: { statusId?: string }) => {
  const { data: statusData } = useQuery<SuccessResponse>({
    queryKey: ['status', { id: statusId }],
    queryFn: fetchStatus,
    enabled: !!statusId,
  });

  return { statusData };
};

export { fetchStatus, useFetchStatus };
