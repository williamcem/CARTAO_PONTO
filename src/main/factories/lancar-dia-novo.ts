/* import { CompensacaoEventoRepository } from "@infra/db/postgresdb/compensacao-eventos-automaticos-repository/compensacao-eventos-automaticos-repository";
 */import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { LancarDiaPostgresRepositoryNovo } from "@infra/db/postgresdb/lancar-dia-novo/lancar-dia-novo";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

import { LancarDiaControllerNovo } from "../../presentation/controllers/lancar-dia-novo/lancar-dia-novo";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeLancarDiaNovoController = (): Controller => {
  const lancarDiaPostgresRepositoryNovo = new LancarDiaPostgresRepositoryNovo();
/*   const compensacaoEventoRepository = new CompensacaoEventoRepository();
 */  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);

  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(
    recalcularTurnoController,
/*     compensacaoEventoRepository
 */  );

  // Adicionando o LancarFaltaPostgresRepository
  const lancarFaltaPostgresRepository = new LancarFaltaPostgresRepository();

  // Passando todos os 4 argumentos necessários para o controller
  const lancarDiaControllerNovo = new LancarDiaControllerNovo(
    lancarDiaPostgresRepositoryNovo,
    criarEventosPostgresRepository,
    lancarFaltaPostgresRepository, // LancarFaltaPostgresRepository agora é incluído
    recalcularTurnoController, // RecalcularTurnoController também é incluído
  );

  return new LogControllerDecorator(lancarDiaControllerNovo);
};
