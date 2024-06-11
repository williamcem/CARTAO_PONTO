import { Router } from "express";

import { ExportarDemitidosController } from "../../../presentation/controllers/exportar-demitidos/exportar-lancamentos";
import { adaptRoute } from "../../adapters/express-route-adapter";

const route = (router: Router): void => {
  router.post("/exportarDemitidos-lancamentos", adaptRoute(new ExportarDemitidosController()));
};

export default route;
