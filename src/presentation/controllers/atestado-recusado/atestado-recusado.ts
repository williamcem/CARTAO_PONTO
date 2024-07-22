import moment from "moment";

import { RespaldarAtestadoRecusadoPostgresRepository } from "@infra/db/postgresdb/atestado-recusado-repository/atestado-recusado-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./recusado-protocols";

type IDia = {
  id: number;
  data: Date;
  cargaHoraria: number;
  cargaHorariaPrimeiroPeriodo: number;
  cargaHorariaSegundoPeriodo: number;
  cargaHorariaCompleta: string;
  descanso: number;
};

export class RespaldarRecusadoController implements Controller {
  constructor(private readonly respaldarAtestadoRecusadoPostgresRepository: RespaldarAtestadoRecusadoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        id,
        statusId,
        userName,
        inicio,
        fim,
        observacao,
      }: { id: number; statusId: number; userName: string; inicio: Date; fim: Date; observacao: string } = httpRequest?.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!statusId) return badRequest(new FuncionarioParamError("Falta status!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));

      if (!inicio) return badRequest(new FuncionarioParamError("Falta inicio!"));
      if (!fim) return badRequest(new FuncionarioParamError("Falta fim!"));

      if (!new Date(inicio).getTime()) return badRequest(new FuncionarioParamError("Data de início inválida!"));
      if (!new Date(fim).getTime()) return badRequest(new FuncionarioParamError("Data de fim inválida!"));

      if (moment(inicio).isAfter(fim)) return badRequest(new FuncionarioParamError("Data inicial não pode ser após o fim!"));

      const atestado = await this.respaldarAtestadoRecusadoPostgresRepository.findfirst({ id });

      if (!atestado) return notFoundRequest(new FuncionarioParamError("Atestado não encontrado!"));

      switch (statusId) {
        case 1:
          return badRequest(new FuncionarioParamError(`Não é possível resolver com status 1`));

        case 2:
          break;

        case 3:
          break;

        default:
          return badRequest(new FuncionarioParamError(`Status ${statusId} não tratado!`));
      }

      switch (atestado.documentoId) {
        case 1:
          break;
        case 2:
          return badRequest(new FuncionarioParamError(`OUTROS COMPROVANTES não tratado!`));

        case 3:
          return badRequest(new FuncionarioParamError(`ATESTADO OCUPACIONAL não tratado`));

        default:
          return badRequest(new FuncionarioParamError(`Documento ${statusId} não tratado!`));
      }

      if (atestado.statusId !== 1) return badRequest(new FuncionarioParamError("Atestado já tratado!"));

      const dataInicio = moment.utc(inicio).set({ h: 0, minute: 0, second: 0, millisecond: 0 }).toDate();

      const dias = await this.respaldarAtestadoRecusadoPostgresRepository.findManyCartaoDia({
        inicio: dataInicio,
        fim: fim,
        funcionarioId: atestado.funcionarioId,
      });

      let message = "";

      switch (statusId) {
        case 2:
          {
            let abonos: { cartaoDiaId: number; data: Date; minutos: number }[] = [];

            abonos = this.gerarAbono(dias, { inicio, fim });

            const atualizado = await this.respaldarAtestadoRecusadoPostgresRepository.updateAtestado({
              id: atestado.id,
              statusId,
              userName,
              abonos,
              observacao,
              fim,
              inicio,
            });

            if (!atualizado) return serverError();

            message = "Abono aprovado com sucesso!";
          }
          break;

        case 3:
          {
            const atestadoAcao = await this.respaldarAtestadoRecusadoPostgresRepository.findAtestadoAcao({ id });
            if (atestadoAcao.acao === 3) {
              const abonos = dias.map((dia) => ({
                cartaoDiaId: dia.id,
                data: dia.data,
                minutos: 0,
              }));

              const atualizado = await this.respaldarAtestadoRecusadoPostgresRepository.updateAtestado({
                id: atestado.id,
                statusId,
                userName,
                abonos,
                observacao,
                fim,
                inicio,
              });

              if (!atualizado) return serverError();

              message = "Abono recusado e minutos zerados com sucesso!";
            } else {
              const abonos = [];

              const atualizado = await this.respaldarAtestadoRecusadoPostgresRepository.updateAtestado({
                id: atestado.id,
                statusId,
                userName,
                abonos,
                observacao,
                fim,
                inicio,
              });

              if (!atualizado) return serverError();

              message = "Abono recusado com sucesso!";
            }
          }
          break;

        default:
          return badRequest(new FuncionarioParamError(`Status ${atestado.statusId} não tratado`));
      }

      return ok({ message });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  protected transformarCargaHoraria(input: {
    data: Date;
    cargaHorariaCompleta: string;
    cargaHorariaPrimeiroPeriodo: number;
    cargaHorariaSegundoPeriodo: number;
  }): Date[] {
    const datas: Date[] = [];
    const [entradaManha, saidaManha, entradaTarde, saidaTarde] = input.cargaHorariaCompleta.split(";");

    if (input.cargaHorariaPrimeiroPeriodo) {
      {
        const [hora, minuto] = entradaManha.split(".");
        datas.push(
          moment
            .utc(input.data)
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
      {
        const [hora, minuto] = saidaManha.split(".");
        datas.push(
          moment
            .utc(input.data)
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
    }

    if (input.cargaHorariaSegundoPeriodo) {
      {
        const [hora, minuto] = entradaTarde.split(".");
        datas.push(
          moment
            .utc(input.data)
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
      {
        const [hora, minuto] = saidaTarde.split(".");
        datas.push(
          moment
            .utc(input.data)
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
    }

    return datas;
  }

  public gerarAbono(dias: IDia[], itervalo: { inicio: Date; fim: Date }) {
    const atestadoDia: { data: Date; minutos: number; cartaoDiaId: number }[] = [];

    dias.map((dia) => {
      if (dia.cargaHoraria === 0) return undefined;

      const horariosTrabalho = this.transformarCargaHoraria({
        data: dia.data,
        cargaHorariaCompleta: dia.cargaHorariaCompleta,
        cargaHorariaPrimeiroPeriodo: dia.cargaHorariaPrimeiroPeriodo,
        cargaHorariaSegundoPeriodo: dia.cargaHorariaSegundoPeriodo,
      });

      const eAntes = horariosTrabalho.findIndex((horarioTrabalho) => moment(itervalo.inicio).isAfter(horarioTrabalho));
      const eDepois = horariosTrabalho.findIndex((horarioTrabalho) => moment(itervalo.fim).isBefore(horarioTrabalho));

      //Se a data do inicio do atestado for antes e o final do atestado for depois do horario de trabalho abona o dia inteiro
      if (eAntes === -1 && eDepois === -1) {
        atestadoDia.push({ data: dia.data, minutos: dia.cargaHoraria, cartaoDiaId: dia.id });
      } else {
        let minutos = 0;

        //Quando o atestado está entre algum periodo
        if (
          (dia.cargaHorariaPrimeiroPeriodo &&
            moment(itervalo.inicio).isSameOrAfter(horariosTrabalho[0]) &&
            moment(itervalo.fim).isSameOrBefore(horariosTrabalho[1])) ||
          (dia.cargaHorariaSegundoPeriodo &&
            moment(itervalo.inicio).isSameOrAfter(horariosTrabalho[2]) &&
            moment(itervalo.fim).isSameOrBefore(horariosTrabalho[3]))
        ) {
          minutos = moment(itervalo.fim).diff(itervalo.inicio, "minutes");
        }
        //Quando o atestado está entre o dia
        else if (
          dia.cargaHorariaPrimeiroPeriodo &&
          dia.cargaHorariaSegundoPeriodo &&
          moment(itervalo.inicio).isSameOrAfter(horariosTrabalho[0]) &&
          moment(itervalo.fim).isSameOrBefore(horariosTrabalho[3])
        ) {
          minutos = moment(itervalo.fim).diff(itervalo.inicio, "minutes") - dia.descanso;
        }
        //Quando o atestado inicou no segundo periodo e o fim é após termino do dia
        else if (
          dia.cargaHorariaSegundoPeriodo &&
          moment(itervalo.inicio).isAfter(horariosTrabalho[2]) &&
          moment(itervalo.fim).isAfter(horariosTrabalho[3])
        ) {
          minutos = moment(horariosTrabalho[3]).diff(itervalo.inicio, "minutes");
        }
        //Quando o atestado inicou no primeiro periodo e o fim é após termino do dia
        else if (
          dia.cargaHorariaPrimeiroPeriodo &&
          moment(itervalo.inicio).isAfter(horariosTrabalho[0]) &&
          moment(itervalo.fim).isAfter(horariosTrabalho[1])
        ) {
          minutos =
            moment(dia.cargaHorariaSegundoPeriodo ? horariosTrabalho[3] : horariosTrabalho[1]).diff(itervalo.inicio, "minutes") -
            (dia.cargaHorariaSegundoPeriodo ? dia.descanso : 0);
        }

        atestadoDia.push({
          data: dia.data,
          minutos,
          cartaoDiaId: dia.id,
        });
      }
      return undefined;
    });

    return atestadoDia;
  }
}
