import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarOcorrenciaGeralSolucionadasController } from "../../factories/listar-ocorrencia-geral-solucionadas";

const route = (router: Router): void => {
  router.get("/ocorrencia-geral-solucionada", adaptRoute(makeListarOcorrenciaGeralSolucionadasController()));
};

export default route;
