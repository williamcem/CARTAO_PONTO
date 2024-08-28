import cors from "cors";
import Express, { NextFunction, Request, Response } from "express";

import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";

const app = Express();
app.use((req: Request, resp: Response, next: NextFunction) => {
  console.log(req.method, req.ip, req.url, req.body);
  next();
});
app.use(cors());
setupMiddlewares(app);
setupRoutes(app);

export default app;

/* import cors from "cors";
import Express, { NextFunction, Request, Response } from "express";

import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";

const app = Express();

app.use(cors());
app.use((req: Request, resp: Response, next: NextFunction) => {
/*   console.log("Requisição", req.url, req.query, req.body, req.ip);
  next();
});

setupMiddlewares(app);
setupRoutes(app);
export default app;
 */
