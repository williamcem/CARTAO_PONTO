import { Router } from "express";
import { makeHorariosMemoryController } from "../../factories/horarios-memory";
import { adaptRoute } from "../../adapters/express-route-adapter";

// Rota para adicionar dados
const route = (router: Router): void => {
  router.post("/horariosMemory", adaptRoute(makeHorariosMemoryController()));
};

export default route;
