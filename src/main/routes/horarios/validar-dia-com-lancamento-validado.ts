import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeValidarDiaComLancamentoValidadoController } from "../../factories/validar-dia-com-lancamento-validado";

const route = (router: Router): void => {
  router.put("/dia/validar-ja-lancado", adaptRoute(makeValidarDiaComLancamentoValidadoController()));
};

export default route;
