import Express from "express";
import setupMiddlewares from "./middlewares";
import { setupRoutes } from "./routes";
import cors from "cors";

const app = Express();
app.use(cors());
setupMiddlewares(app);
setupRoutes(app);
export default app;
