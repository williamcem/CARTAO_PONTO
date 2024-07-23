import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGetFuncionarioAtestadoController } from "../../factories/funcionario-atestado";

const route = (router: Router): void => {
  router.get("/funcionario-atestado", adaptRoute(makeGetFuncionarioAtestadoController()));
};

export default route;
