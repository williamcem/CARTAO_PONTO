import moment from "moment";

import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./respaldar-atestado-protocols";

type IDia = {
  id: number;
  data: Date;
  cargaHoraria: number;
  cargaHorariaPrimeiroPeriodo: number;
  cargaHorariaSegundoPeriodo: number;
  cargaHorariaCompleta: string;
  descanso: number;
};

export class RespaldarController implements Controller {
  constructor(private readonly respaldarAtestadoPostgresRepository: RespaldarAtestadoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        id,
        statusId,
        userName,
        inicio,
        fim,
        observacao,
        data,
        grupo_cid,
        acidente_trabalho,
        tipoAcompanhanteId,
        descricao,
        tipo_comprovanteId,
        nome_acompanhante,
        tipoId,
        idade_paciente,
        trabalhou_dia,
        horario_trabalhado_inicio,
        horario_trabalhado_fim,
        exame,
        acao,
        sintomas,
        tipoGrauParentescoId,
        nomeFuncionario,
        ocupacaoId,
        crm,
        funcao,
      }: {
        id: number;
        data: Date;
        inicio: Date;
        fim: Date;
        grupo_cid: string;
        acidente_trabalho: boolean;
        tipoAcompanhanteId: number;
        descricao: string;
        tipo_comprovanteId: number;
        nome_acompanhante: string;
        tipoId: number;
        statusId: number;
        idade_paciente: number;
        trabalhou_dia: boolean;
        horario_trabalhado_inicio: string;
        horario_trabalhado_fim: string;
        exame: string;
        acao: number;
        observacao: string;
        sintomas: string;
        tipoGrauParentescoId: number;
        userName: string;
        nomeFuncionario: string;
        ocupacaoId: number;
        funcao: number;
        crm: string;
      } = httpRequest?.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!statusId) return badRequest(new FuncionarioParamError("Falta status!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));

      const atestado = await this.respaldarAtestadoPostgresRepository.findfirst({ id });

      if (!atestado) return notFoundRequest(new FuncionarioParamError("Atestado não encontrado!"));

      const abonosExistentes = await this.respaldarAtestadoPostgresRepository.findManyAbono({ atestadoId: atestado.id });

      if (abonosExistentes.length != 0)
        await this.respaldarAtestadoPostgresRepository.deleteManyAbono(abonosExistentes.map((abono) => abono.id));

      switch (statusId) {
        case 1:

        case 2:
          break;

        case 3:
          break;

        case 4:
          break;

        default:
          return badRequest(new FuncionarioParamError(`Status ${statusId} não tratado!`));
      }

      switch (atestado.documentoId) {
        case 1:
          break;
        case 2:
          break;

        case 3:
          break;

        case 4:
          break;

        default:
          return badRequest(new FuncionarioParamError(`Documento ${statusId} não tratado!`));
      }

      let message = "";

      switch (statusId) {
        case 1:
          {
            const atualizado = await this.respaldarAtestadoPostgresRepository.updateAtestado({
              id: atestado.id,
              statusId,
              userName,
              abonos: [],
              observacao,
              fim,
              inicio,
              acao,
              acidente_trabalho,
              crm,
              data,
              descricao,
              exame,
              funcao,
              grupo_cid,
              horario_trabalhado_fim,
              horario_trabalhado_inicio,
              idade_paciente,
              nome_acompanhante,
              nomeFuncionario,
              ocupacaoId,
              sintomas,
              tipo_comprovanteId,
              tipoAcompanhanteId,
              tipoGrauParentescoId,
              tipoId,
              trabalhou_dia,
            });

            if (!atualizado) return serverError();

            message = "Atestado alterado com sucesso!";
          }
          break;
        case 2:
          {
            if (!inicio) return badRequest(new FuncionarioParamError("Falta inicio!"));
            if (!fim) return badRequest(new FuncionarioParamError("Falta fim!"));

            if (!new Date(inicio).getTime()) return badRequest(new FuncionarioParamError("Data de início inválida!"));
            if (!new Date(fim).getTime()) return badRequest(new FuncionarioParamError("Data de fim inválida!"));

            if (moment(inicio).isAfter(fim))
              return badRequest(new FuncionarioParamError("Data inicial não pode ser após o fim!"));

            const dataInicio = moment.utc(inicio).set({ h: 0, minute: 0, second: 0, millisecond: 0 }).toDate();

            const dias = await this.respaldarAtestadoPostgresRepository.findManyCartaoDia({
              inicio: dataInicio,
              fim: fim,
              funcionarioId: atestado.funcionarioId,
            });

            message = await this.abonar({ dias, atestado: { id: atestado.id, fim, inicio, observacao, statusId }, userName });
          }
          break;

        case 3:
          {
            const atualizado = await this.respaldarAtestadoPostgresRepository.updateAtestado({
              id: atestado.id,
              statusId,
              userName,
              abonos: [],
              observacao,
              fim,
              inicio,
              acao,
              acidente_trabalho,
              crm,
              data,
              descricao,
              exame,
              funcao,
              grupo_cid,
              horario_trabalhado_fim,
              horario_trabalhado_inicio,
              idade_paciente,
              nome_acompanhante,
              nomeFuncionario,
              ocupacaoId,
              sintomas,
              tipo_comprovanteId,
              tipoAcompanhanteId,
              tipoGrauParentescoId,
              tipoId,
              trabalhou_dia,
            });

            if (!atualizado) return serverError();

            message = "Abono recusado com sucesso!";
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
            .utc(moment.utc(input.data))
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
      {
        const [hora, minuto] = saidaManha.split(".");
        const menorPrimeiraEntrada = hora < entradaManha.split(".")[0];
        datas.push(
          moment
            .utc(moment.utc(input.data).add(menorPrimeiraEntrada ? 1 : 0, "d"))
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
    }

    if (input.cargaHorariaSegundoPeriodo) {
      {
        const [hora, minuto] = entradaTarde.split(".");
        const menorPrimeiraEntrada = hora < entradaManha.split(".")[0];
        datas.push(
          moment
            .utc(moment.utc(input.data).add(menorPrimeiraEntrada ? 1 : 0, "d"))
            .set({ hour: Number(hora), minute: Number(minuto) })
            .toDate(),
        );
      }
      {
        const [hora, minuto] = saidaTarde.split(".");
        const menorPrimeiraEntrada = hora < entradaManha.split(".")[0];
        datas.push(
          moment
            .utc(moment.utc(input.data).add(menorPrimeiraEntrada ? 1 : 0, "d"))
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

  public async abonar(input: {
    atestado: {
      id: number;
      inicio: Date;
      fim: Date;
      observacao: string;
      statusId: number;
      grupo_cid?: string;
      acidente_trabalho?: boolean;
      tipoAcompanhanteId?: number;
      descricao?: string;
      tipo_comprovanteId?: number;
      nome_acompanhante?: string;
      tipoId?: number;
      idade_paciente?: number;
      trabalhou_dia?: boolean;
      horario_trabalhado_inicio?: string;
      horario_trabalhado_fim?: string;
      exame?: string;
      acao?: number;
      sintomas?: string;
      tipoGrauParentescoId?: number;
      nomeFuncionario?: string;
      ocupacaoId?: number;
      funcao?: number;
      crm?: string;
      data?: Date;
    };
    userName: string;
    dias: IDia[];
  }): Promise<string> {
    let abonos: { cartaoDiaId: number; data: Date; minutos: number }[] = [];

    abonos = this.gerarAbono(input.dias, { inicio: input.atestado.inicio, fim: input.atestado.fim });

    const atualizado = await this.respaldarAtestadoPostgresRepository.updateAtestado({
      id: input.atestado.id,
      statusId: input.atestado.statusId,
      userName: input.userName,
      abonos,
      observacao: input.atestado.observacao,
      fim: input.atestado.fim,
      inicio: input.atestado.inicio,
      acao: input.atestado.acao,
      acidente_trabalho: input.atestado.acidente_trabalho,
      crm: input.atestado.crm,
      data: input.atestado.data,
      descricao: input.atestado.descricao,
      exame: input.atestado.exame,
      funcao: input.atestado.funcao,
      grupo_cid: input.atestado.grupo_cid,
      horario_trabalhado_fim: input.atestado.horario_trabalhado_fim,
      horario_trabalhado_inicio: input.atestado.horario_trabalhado_inicio,
      idade_paciente: input.atestado.idade_paciente,
      nome_acompanhante: input.atestado.nome_acompanhante,
      nomeFuncionario: input.atestado.nomeFuncionario,
      ocupacaoId: input.atestado.ocupacaoId,
      sintomas: input.atestado.sintomas,
      tipo_comprovanteId: input.atestado.tipo_comprovanteId,
      tipoAcompanhanteId: input.atestado.tipoAcompanhanteId,
      tipoGrauParentescoId: input.atestado.tipoGrauParentescoId,
      tipoId: input.atestado.tipoId,
      trabalhou_dia: input.atestado.trabalhou_dia,
    });

    if (!atualizado) return "Erro ao atualizar atestado";

    const message = "Abono aprovado com sucesso!";

    return message;
  }
}
