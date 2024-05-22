import { Controller } from "../../presentation/protocols/controller";
import { Request, Response } from "express";
import { HttpRequest } from "../../presentation/protocols/http";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const HttpRequest: HttpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
    };
    const httpResponse = await controller.handle(HttpRequest);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  };
};
