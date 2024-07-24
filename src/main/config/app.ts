import cors from "cors";
import Express from "express";

import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";

const app = Express();
app.use(cors());
setupMiddlewares(app);
setupRoutes(app);
export default app;
