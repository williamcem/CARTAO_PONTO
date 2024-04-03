export type HttpResponse<D = any> = {
  code: number;
  data?: D | null;
  error?: string | null;
};

export const ok = <D = any>(data: any): HttpResponse<D> => {
  return { code: 201, data };
}; 

export const unprocessableEntity = (message: string): HttpResponse => {
  return { code: 422, error: message };
};

export const badRequest = (message: string): HttpResponse => {
  return { code: 400, error: message };
};

export const unauthorized = (message: string): HttpResponse => {
  return { code: 401, error: message };
};
