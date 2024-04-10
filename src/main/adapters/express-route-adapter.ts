import { Controller } from "../../presentation/protocols/controller";
import { Request, Response } from "express";
import { HttpRequest } from "../../presentation/protocols/http";
import axios from "axios";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const HttpRequest: HttpRequest = {
      body: req.body,
    };
    const httpResponse = await controller.handle(HttpRequest);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  };
};
