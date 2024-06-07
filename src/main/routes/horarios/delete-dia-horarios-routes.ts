import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDeleteController } from "../../factories/delete-dia-horario-factore";

// Rota para deletar dados
const route = (router: Router): void => {
  router.delete("/deletar", adaptRoute(makeDeleteController()));
};

export default route;
