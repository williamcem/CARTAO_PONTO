import { Router } from "express";

import { ExportarController } from "../../../presentation/controllers/exportar-arquivos-geral/exporatar-lancamentos";
import { adaptRoute } from "../../adapters/express-route-adapter";

const route = (router: Router): void => {
  router.get("/exportar/ausencias.txt", adaptRoute(new ExportarController()));
};

export default route;
