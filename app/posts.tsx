'use client';

import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';

export const getPosts = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  return response.json();
};

export const getComments = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  return response.json();
};

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export function Posts() {
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  });

  return <div>posts</div>;
}
