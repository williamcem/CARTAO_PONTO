import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeAssociarOcorrenciaComAtestadoController } from "../../factories/associar-ocorrencia-com-atestado";

const route = (router: Router): void => {
  router.put("/ocorrencia/atestado/linkar", adaptRoute(makeAssociarOcorrenciaComAtestadoController()));
};

export default route;
