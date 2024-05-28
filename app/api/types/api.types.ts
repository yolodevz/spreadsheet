type SuccessResponse = {
  status: 'DONE' | 'IN_PROGRESS';
  id?: string;
  done_at?: string;
};

export type { SuccessResponse };
