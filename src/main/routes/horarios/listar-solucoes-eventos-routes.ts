import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeTiposSolucoesController } from "../../factories/listar-solucoes-eventos";

const route = (router: Router): void => {
  router.get("/tipo-evento", adaptRoute(makeTiposSolucoesController()));
};

export default route;
