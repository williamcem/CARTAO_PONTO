import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { AssociarOcorrenciaComAtestadoController } from "../../presentation/controllers/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { AssociarOcorrenciaComAtestadoPostgresRepository } from "@infra/db/postgresdb/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { SolucaoEventoRepository } from "@infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";

export const makeAssociarOcorrenciaComAtestadoController = (): Controller => {
  const associarOcorrenciaComAtestadoPostgresRepository = new AssociarOcorrenciaComAtestadoPostgresRepository();
  const solucaoEventoRepository = new SolucaoEventoRepository();
  const associarOcorrenciaComAtestadoController = new AssociarOcorrenciaComAtestadoController(
    associarOcorrenciaComAtestadoPostgresRepository,
    solucaoEventoRepository,
  );

  return new LogControllerDecorator(associarOcorrenciaComAtestadoController);
};
