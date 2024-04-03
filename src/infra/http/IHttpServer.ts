import { HttpResponse } from "./HttpResponse";

export type MethodType = "get" | "post" | "put" | "delete";

export type CallbackType = (input: { params: any; body: any; auth: any }) => Promise<HttpResponse>;

export type OnInput = {
  method: MethodType;
  url: string;
  callback: CallbackType;
  isPrivate?: boolean;
};

export interface IHttpServer {
  on(input: OnInput): void;
  listen(port: number): void;
}
