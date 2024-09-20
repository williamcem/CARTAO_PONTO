import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarOcorrenciaMinutoAusenteController } from "../../factories/buscar-ocorrencia-minuto-ausente";

const route = (router: Router): void => {
  router.get("/ocorrencia/minuto-ausente", adaptRoute(makeBuscarOcorrenciaMinutoAusenteController()));
};

export default route;
