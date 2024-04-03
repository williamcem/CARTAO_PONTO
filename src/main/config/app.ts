import Express from "express";
import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";

const app = Express();
setupMiddlewares(app);
setupRoutes(app);
export default app;
