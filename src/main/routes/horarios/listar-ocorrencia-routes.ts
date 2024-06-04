import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarOcorrenciasController } from "../../factories/listar-ocorrencia";

const route = (router: Router): void => {
  router.get("/ocorrencia", adaptRoute(makeListarOcorrenciasController()));
};

export default route;
