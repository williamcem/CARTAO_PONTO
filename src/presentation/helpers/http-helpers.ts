import { HttpResponse } from "../protocols/http";
import { ServerError } from "../errors/server-error";

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error,
});

export const notFoundRequest = (error: Error): HttpResponse => ({
  statusCode: 404,
  body: error,
});

export const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: new ServerError(),
});

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data,
});

export const notAuthorized = (error: Error): HttpResponse => ({
  statusCode: 401,
  body: error,
});

/* const sendError = (message: string, error: "Bad Request" | "Not Found" | "Server Error"): HttpResponse => {
  const output: HttpResponse;
};
 */
