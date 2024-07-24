import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarOcupacaoController } from "../../factories/listar-ocupacao";

const route = (router: Router): void => {
  router.get("/listar-ocupacao", adaptRoute(makeListarOcupacaoController()));
};

export default route;
