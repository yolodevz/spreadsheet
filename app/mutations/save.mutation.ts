import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import FormDataAddon from 'wretch/addons/formData';
import wretch from 'wretch';
import { fetchStatus } from '@/app/queries/get-status.query';
import { SuccessResponse } from '@/app/api/types/api.types';

type UploadPayload = {
  payload: {
    file: File;
  };
};

type Save = UseMutationResult<SuccessResponse, Error, UploadPayload>;

const POLL_INTERVAL = 5000;

export function useSave(): Save {
  const queryClient = useQueryClient();

  const mutation = useMutation<SuccessResponse, Error, UploadPayload>({
    mutationFn: async ({ payload }: UploadPayload) => {
      const formData = new FormData();
      formData.append('file', payload.file);

      return await wretch()
        .addon(FormDataAddon)
        .url('api/save')
        .formData(formData)
        .post()
        .json<SuccessResponse>();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['status', { id: data.id }], data);

      if (data.status === 'IN_PROGRESS' && data.id) {
        pollStatus(data.id);
      }
    },
  });

  const pollStatus = async (id: string) => {
    const checkStatus = async () => {
      const statusResponse = await fetchStatus({
        queryKey: ['status', { id: id }],
      });

      queryClient.setQueryData(['status', { id: id }], statusResponse);

      if (statusResponse.status === 'IN_PROGRESS') {
        console.log('in progress, polling');
        setTimeout(checkStatus, POLL_INTERVAL);
      }
    };

    checkStatus();
  };

  return mutation;
}
