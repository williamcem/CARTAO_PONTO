import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGetFuncionarioController } from "../../factories/get-funcionario";

const route = (router: Router): void => {
  router.get("/funcionario", adaptRoute(makeGetFuncionarioController()));
};

export default route;
