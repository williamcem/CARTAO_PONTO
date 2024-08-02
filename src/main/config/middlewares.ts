import { Express } from "express";

import { bodyParser, contentType, cors } from "../middlewares";

// eslint-disable-next-line import/no-anonymous-default-export
export default (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
};
