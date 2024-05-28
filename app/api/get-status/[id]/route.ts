import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

export async function GET(
  request: Request,
  route: { params: { id: string } }
): Promise<Response> {
  const response = await wretch()
    .url(`http://localhost:8082/get-status`)
    .addon(QueryStringAddon)
    .options({
      cache: 'no-store',
    })
    .query({ id: route.params.id })
    .get()
    .error(500, (error) => {
      return Response.json(error.json, { status: 500 });
    })
    .json();

  console.log('response from get', response);

  return Response.json(response);
}
