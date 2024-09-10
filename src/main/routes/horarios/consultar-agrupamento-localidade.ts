import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeConsultarAgrupamentoLocalidadeController } from "../../factories/consultar-agrupamento-localidade";

const route = (router: Router): void => {
  router.get("/localidade/agrupamento", adaptRoute(makeConsultarAgrupamentoLocalidadeController()));
};

export default route;
