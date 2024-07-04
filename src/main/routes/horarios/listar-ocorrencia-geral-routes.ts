import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarOcorrenciaGeralController } from "../../factories/listar-ocorrencia-geral";

const route = (router: Router): void => {
  router.get("/ocorrencia-geral", adaptRoute(makeListarOcorrenciaGeralController()));
};

export default route;
