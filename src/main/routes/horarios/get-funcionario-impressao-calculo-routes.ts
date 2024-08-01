import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGetFuncionarioImpressaoCalculoController } from "../../factories/get-funcionario-impressao-calculo";

const route = (router: Router): void => {
  router.get("/funcionario-impressao-calculo", adaptRoute(makeGetFuncionarioImpressaoCalculoController()));
};

export default route;
