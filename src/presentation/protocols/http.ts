export interface HttpRequest {
  body?: any;
  params?: any;
  query?: any;
  headers?: { authorization?: string };
  payload?: any;
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}
