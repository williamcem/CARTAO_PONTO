import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarTodosController } from "../../factories/buscar-todos-funcionarios";

const route = (router: Router): void => {
  router.get("/todosfuncionario", adaptRoute(makeBuscarTodosController()));
};

export default route;
