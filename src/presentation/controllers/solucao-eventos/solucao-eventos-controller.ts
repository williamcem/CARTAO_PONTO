import moment from "moment";
import { SolucaoEventoRepository } from "../../../infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, badRequestNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./eventos-protocols";

export class CriarEventoController implements Controller {
  constructor(private readonly solucaoEventoRepository: SolucaoEventoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { eventos }: { eventos: { cartaoDiaId: number; tipoId: number; minutos: number; inicio: Date; fim: Date }[] } =
      httpRequest?.body;

    try {
      if (eventos?.length === 0) return badRequest(new FuncionarioParamError("Falta evento!"));
      const eventosFormatado: {
        funcionarioId: number;
        cartaoDiaId: number;
        tipoId: number;
        minutos: number;
        inicio: Date;
        fim: Date;
      }[] = [];
      for (const { cartaoDiaId, tipoId, minutos, inicio, fim } of eventos) {
        if (!Number(cartaoDiaId)) return badRequest(new FuncionarioParamError("Falta id do dia!"));
        if (!Number(tipoId)) return badRequest(new FuncionarioParamError("Falta o tipo de solução!"));
        if (!Number(minutos)) return badRequest(new FuncionarioParamError("Falta minutos!"));
        if (!inicio) return badRequest(new FuncionarioParamError("Falta inicio!"));
        if (!fim) return badRequest(new FuncionarioParamError("Falta fim!"));

        if (!moment(fim).isValid()) return badRequestNovo({ message: "Data fim inválida!" });
        if (!moment(inicio).isValid()) return badRequestNovo({ message: "Data inicio inválida!" });

        if (!Number.isInteger(Number(minutos))) return badRequestNovo({ message: "Minutos é número!" });

        if (Number(tipoId) !== 3 && Number(tipoId) !== 5 && Number(tipoId) !== 6 && Number(tipoId) !== 7 && Number(tipoId) !== 12)
          return badRequestNovo({ message: "Tipo não permitido!" });

        const dia = await this.solucaoEventoRepository.findFisrtDia({
          id: Number(cartaoDiaId),
        });

        if (!dia) return badRequestNovo({ message: "Cartao dia inexistente!" });

        const existEvento = await this.solucaoEventoRepository.findFisrEvento({
          cartaoDiaId: Number(cartaoDiaId),
          fim: moment.utc(fim).toDate(),
          inicio: moment.utc(inicio).toDate(),
          tipoId: Number(tipoId),
        });

        if (existEvento) return badRequestNovo({ message: "Evento já solucionado!" });

        eventosFormatado.push({
          cartaoDiaId: Number(cartaoDiaId),
          fim: moment.utc(fim).toDate(),
          funcionarioId: dia.cartao.funcionarioId,
          inicio: moment.utc(inicio).toDate(),
          minutos: Number(minutos),
          tipoId: Number(tipoId),
        });
      }

      const eventoCriado = await this.solucaoEventoRepository.add(eventosFormatado);

      if (!eventoCriado) throw "Não foi possivel aplicar a solução!";

      return ok({ message: "Solução aplicada com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
