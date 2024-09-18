import cors from "cors";
import Express, { NextFunction, Request, Response } from "express";

import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";
import { setupTask } from "./tasks";

const app = Express();

app.use(cors());
setupMiddlewares(app);

app.use((req: Request, resp: Response, next: NextFunction) => {
  console.log(req.method, req.ip, req.url, req.body);
  next();
});

setupRoutes(app);
setupTask();

export default app;
