import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./alterar-localidade-protocols";
import moment from "moment";

export class AlterarLocalidadeController implements Controller {
  constructor(private readonly alterarLocalidadePostgresRepository: AlterarLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId, localidadeId, turnoId, inicioVigencia, fimVigencia, userName } = httpRequest?.body;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionário!"));
      if (!inicioVigencia) return badRequest(new FuncionarioParamError("Falta inicio vigência!"));
      if (!fimVigencia) return badRequest(new FuncionarioParamError("Falta fim vigência!"));
      if (!turnoId) return badRequest(new FuncionarioParamError("Falta turno!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta username!"));

      if (!moment(inicioVigencia).isValid()) return badRequest(new FuncionarioParamError("Início vigência não é válido!"));
      if (!moment(fimVigencia).isValid()) return badRequest(new FuncionarioParamError("Fim vigência não é válido!"));

      const funcionario = await this.alterarLocalidadePostgresRepository.findFisrtFuncionario({ id: Number(funcionarioId) });

      if (!funcionario) return notFoundRequest(new FuncionarioParamError("Funcionário inexistente!"));

      if (localidadeId) {
        const localidade = await this.alterarLocalidadePostgresRepository.findFisrtLocalidade({
          id: localidadeId,
        });

        if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeId} não existe!`));
      }

      const update: {
        dias: {
          id: number;
          statusId: number;
          periodoDescanso: number;
          cargaHor: number;
          cargaHorPrimeiroPeriodo: number;
          cargaHorSegundoPeriodo: number;
          cargaHorariaCompleta: string;
          cargaHorariaNoturna: number;
          updateAt: Date;
          userName: string;
        }[];
      } = { dias: [] };

      const turno = await this.alterarLocalidadePostgresRepository.findFisrtTurno({
        id: turnoId,
      });

      if (!turno) return notFoundRequest(new FuncionarioParamError(`Turno ${localidadeId} não existe!`));

      const dias = await this.alterarLocalidadePostgresRepository.findManyDias({
        fim: new Date(fimVigencia),
        inicio: new Date(inicioVigencia),
        funcionarioId: funcionario.id,
      });

      dias.map((dia) => {
        const updateAt = moment.utc().toDate();
        const diaSemana = moment(dia.data).weekday();

        const existeTurnoDia = turno.turno_dias.find((turnoDia) => turnoDia.diaSemana === diaSemana);

        if (!existeTurnoDia) {
          update.dias.push({
            id: dia.id,
            cargaHor: 0,
            cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
            cargaHorariaNoturna: 0,
            cargaHorPrimeiroPeriodo: 0,
            cargaHorSegundoPeriodo: 0,
            periodoDescanso: 0,
            statusId: 6,
            updateAt,
            userName,
          });
        } else {
          update.dias.push({
            id: dia.id,
            cargaHor: existeTurnoDia.cargaHoraria,
            cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
            cargaHorariaNoturna: 0,
            cargaHorPrimeiroPeriodo: existeTurnoDia.cargaHorariaPrimeiroPeriodo,
            cargaHorSegundoPeriodo: existeTurnoDia.cargaHorariaSegundoPeriodo,
            periodoDescanso: existeTurnoDia.periodoDescanso,
            statusId: 1,
            updateAt,
            userName,
          });
        }
      });

      console.log(update);

      const saved = await this.alterarLocalidadePostgresRepository.updateFuncionario({
        id: funcionario.id,
        localidadeId,
        turnoId: turnoId ? Number(turnoId) : undefined,
      });

      if (!saved) serverError();

      return ok({ message: "Funcionário alterado com sucesso!" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
