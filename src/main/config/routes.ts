import { Express, Router } from "express";

import horarios from "../routes/horarios/horarios-routes";
import lista from "../routes/horarios/lista-routes";
import saldo from "../routes/horarios/saldo-routes";
import upload from "../routes/horarios/upload-routes";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  horarios(router);
  lista(router);
  saldo(router);
  upload(router);
  // fg.sync("**/src/main/routes/*/**routes.ts").map(async (file) => {
  //   (await import(`../../../${file}`)).default(router);
  // });
};
