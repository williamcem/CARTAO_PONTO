import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { AssociarOcorrenciaComAtestadoController } from "../../presentation/controllers/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { AssociarOcorrenciaComAtestadoPostgresRepository } from "@infra/db/postgresdb/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";

export const makeAssociarOcorrenciaComAtestadoController = (): Controller => {
  const associarOcorrenciaComAtestadoPostgresRepository = new AssociarOcorrenciaComAtestadoPostgresRepository();
  const associarOcorrenciaComAtestadoController = new AssociarOcorrenciaComAtestadoController(
    associarOcorrenciaComAtestadoPostgresRepository,
  );

  return new LogControllerDecorator(associarOcorrenciaComAtestadoController);
};
