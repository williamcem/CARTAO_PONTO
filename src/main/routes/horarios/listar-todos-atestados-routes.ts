import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarTodosAtestadosController } from "../../factories/listar-todos-atestados";

const route = (router: Router): void => {
  router.get("/listar-todosatestado", adaptRoute(makeListarTodosAtestadosController()));
};

export default route;
