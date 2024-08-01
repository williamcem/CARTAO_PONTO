import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGetFuncionarioImpressaoController } from "../../factories/get-funcionario-impressao";

const route = (router: Router): void => {
  router.get("/funcionario-impressao", adaptRoute(makeGetFuncionarioImpressaoController()));
};

export default route;
