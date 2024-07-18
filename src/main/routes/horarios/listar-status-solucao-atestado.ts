import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeSolucaoEventosAtestadoController } from "../../factories/solucao-eventos-atestado";

const route = (router: Router): void => {
  router.get("/listar-solucao-atestado", adaptRoute(makeSolucaoEventosAtestadoController()));
};

export default route;
