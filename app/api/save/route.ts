import FormDataAddon from 'wretch/addons/formData';
import { NextResponse } from 'next/server';
import wretch from 'wretch';
import { SuccessResponse } from '@/app/api/types/api.types';

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file');

  const response = await wretch()
    .addon(FormDataAddon)
    .url('http://localhost:8082/save')
    .formData({
      file,
    })
    .post()
    .error(500, (error) => {
      return NextResponse.json(error, { status: 500 });
    })
    .res();

  if (!response.ok) {
    const error = await response.json();

    return NextResponse.json(error, { status: response.status });
  }

  const result = (await response.json()) as SuccessResponse;

  console.log('result from save', result);

  return NextResponse.json(result);
}
