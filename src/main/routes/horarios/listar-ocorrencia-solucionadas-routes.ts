import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarOcorrenciasSolucionadasController } from "../../factories/listar-ocorrencia-solucionadas ";

const route = (router: Router): void => {
  router.get("/ocorrencia-solucionadas", adaptRoute(makeListarOcorrenciasSolucionadasController()));
};

export default route;
