import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchStatus, Posts } from './posts';
import { Spreadsheet } from '@/app/spreadsheet';

export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Spreadsheet />
    </HydrationBoundary>
  );
}
