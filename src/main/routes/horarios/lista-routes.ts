import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListaHorarioController } from "../../factories/get-horarios";

// Rota para listar os horários
const route = (router: Router): void => {
  router.get("/horarios", adaptRoute(makeListaHorarioController()));
};

export default route;
