import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

type SuccessResponse = {
  status: 'DONE';
  id?: string;
  done_at?: string;
};

export async function GET(
  request: Request,
  route: { params: { id: string } }
): Promise<Response> {
  const response = await wretch()
    .url(`http://localhost:8082/get-status`)
    .addon(QueryStringAddon)
    .query({ id: route.params.id })
    .get()
    .json();

  console.log('response from get', response);

  return Response.json(response);
}
