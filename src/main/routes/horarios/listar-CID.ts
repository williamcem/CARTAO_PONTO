import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeProcurarLocalidadeController } from "../../factories/listar-status-lancamento";

const route = (router: Router): void => {
  router.get("/CID", adaptRoute(makeProcurarLocalidadeController()));
};

export default route;