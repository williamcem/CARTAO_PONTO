import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./recalcular-turno-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";
import moment from "moment";
import "moment/locale/pt-br";

export class RecalcularTurnoController implements Controller {
  constructor(private readonly recalcularTurnoPostgresRepository: RecalcularTurnoPostgresRepository) {}
  private regex =
    /^(SEGaSEX|SEG|TERaSEX|DOM|SEGaSAB|DOMaSEX|SEGaDOM|SEGaSEXeDOM|SEGaQUI|SEGeQUAeSEX)(-\d{2}:\d{2}\/\d{2}:\d{2}(_\d{2}:\d{2}\/\d{2}:\d{2})?)(\s(SAB|SEGaSEX|SEG|TERaSEX|DOM|SEX|TEReQUI)-\d{2}:\d{2}\/\d{2}:\d{2}(_\d{2}:\d{2}\/\d{2}:\d{2})?)*$/;
  private localeData = moment.localeData();

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const turnos = await this.recalcularTurnoPostgresRepository.findMany();

      const dias: {
        turnoId: number;
        diaSemana: number;
        cargaHoraria: number;
        cargaHorariaPrimeiroPeriodo: number;
        cargaHorariaSegundoPeriodo: number;
        periodoDescanso: number;
      }[] = [];

      const errors: string[] = [];
      for (const turno of turnos) {
        if (!this.validarTurno({ nome: turno.nome })) {
          errors.push(`Turno ${turno.nome} do id ${turno.id} é inválido!`);
        }
      }
      turnos.map((turno) => {
        const horarios = this.extrairHorariosTurno({ nome: turno.nome });
        horarios.map((horario) => {
          dias.push({ ...horario, ...{ turnoId: turno.id } });
        });
      });

      const created = await this.recalcularTurnoPostgresRepository.delateMany(dias);

      if (!created) return serverError();

      return ok({ message: dias });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  public validarTurno(input: { nome: string }) {
    return this.regex.test(input.nome);
  }

  public extrairHorariosTurno(input: { nome: string }) {
    const output: {
      diaSemana: number;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      periodoDescanso: number;
    }[] = [];

    // Expressão regular para capturar cada dia com seus horários
    const regexDiaHorario =
      /(SEGaSEX|SEG|TERaSEX|DOM|SEGaSAB|DOMaSEX|SEGaDOM|SEGaSEXeDOM|SEGaQUI|SEGeQUAeSEX|SAB|SEX|TEReQUI)-([\d:\/_]+)/g;
    const regexHoras = /\d{2}:\d{2}/g;

    // Variável para armazenar os resultados
    let horariosPorSemana: Record<string, string[]> = {};
    let match: RegExpExecArray | null;

    // Itera sobre cada dia e seus horários correspondentes
    while ((match = regexDiaHorario.exec(input.nome)) !== null) {
      const [_, dia, horarios] = match;

      // Extrai todas as horas e minutos dos horários encontrados
      const horasMinutos = horarios.match(regexHoras);

      // Se houver horários, adiciona ao objeto resultados
      if (horasMinutos) {
        horariosPorSemana[dia] = horasMinutos;
      }
    }

    for (const dia in horariosPorSemana) {
      if (horariosPorSemana.hasOwnProperty(dia)) {
        const localOutput: {
          cargaHoraria: number;
          cargaHorariaPrimeiroPeriodo: number;
          cargaHorariaSegundoPeriodo: number;
          periodoDescanso: number;
        } = { cargaHoraria: 0, cargaHorariaPrimeiroPeriodo: 0, cargaHorariaSegundoPeriodo: 0, periodoDescanso: 0 };

        const horariosDoDia = horariosPorSemana[dia];

        localOutput.periodoDescanso = this.localizarPeriodoDescanso({ horarios: horariosDoDia });
        localOutput.cargaHorariaPrimeiroPeriodo = this.localizarPrimeiroPeriodo({ horarios: horariosDoDia });
        localOutput.cargaHorariaSegundoPeriodo = this.localizarSegundoPeriodo({ horarios: horariosDoDia });
        localOutput.cargaHoraria = localOutput.cargaHorariaPrimeiroPeriodo + localOutput.cargaHorariaSegundoPeriodo;

        const diasSemana = this.montarDiasDaSemana({ ...localOutput, ...{ dia } });
        diasSemana.map((diaSemanaLocal) => output.push({ ...diaSemanaLocal, ...{} }));
      }
    }

    return output;
  }

  private localizarPeriodoDescanso(input: { horarios: string[] }) {
    if (input.horarios.length !== 4) return 0;
    const [horaSaida, minutoSaida] = input.horarios[1].split(":");
    const [horaEntrada, minutoEntrada] = input.horarios[2].split(":");
    const horarioSaida = moment()
      .utc()
      .set({
        h: Number(horaSaida),
        m: Number(minutoSaida),
      });

    const horarioEntrada = moment()
      .utc()
      .set({
        h: Number(horaEntrada),
        m: Number(minutoEntrada),
      });

    if (Number(horaSaida) > Number(horaEntrada)) horarioEntrada.add(1, "d");

    const minutos = moment(horarioEntrada).diff(horarioSaida, "minutes");
    return minutos;
  }

  private localizarPrimeiroPeriodo(input: { horarios: string[] }) {
    const [horaEntrada, minutoEntrada] = input.horarios[0].split(":");
    const [horaSaida, minutoSaida] = input.horarios[1].split(":");
    const horarioEntrada = moment()
      .utc()
      .set({
        h: Number(horaEntrada),
        m: Number(minutoEntrada),
      });

    const horarioSaida = moment()
      .utc()
      .set({
        h: Number(horaSaida),
        m: Number(minutoSaida),
      });

    if (Number(horaEntrada) > Number(horaSaida)) horarioSaida.add(1, "d");

    const minutos = moment(horarioSaida).diff(horarioEntrada, "minutes");
    return minutos;
  }

  private localizarSegundoPeriodo(input: { horarios: string[] }) {
    if (input.horarios.length !== 4) return 0;
    const [horaEntrada, minutoEntrada] = input.horarios[2].split(":");
    const [horaSaida, minutoSaida] = input.horarios[3].split(":");
    const horarioEntrada = moment()
      .utc()
      .set({
        h: Number(horaEntrada),
        m: Number(minutoEntrada),
      });

    const horarioSaida = moment()
      .utc()
      .set({
        h: Number(horaSaida),
        m: Number(minutoSaida),
      });

    if (Number(horaEntrada) > Number(horaSaida)) horarioSaida.add(1, "d");

    const minutos = moment(horarioSaida).diff(horarioEntrada, "minutes");
    return minutos;
  }

  private montarDiasDaSemana(input: {
    dia: string;
    cargaHoraria: number;
    cargaHorariaPrimeiroPeriodo: number;
    cargaHorariaSegundoPeriodo: number;
    periodoDescanso: number;
  }) {
    const dias: {
      diaSemana: number;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      periodoDescanso: number;
    }[] = [];

    //Entra se houver somente um dia semana
    if (input.dia.length === 3) {
      const diaSemana = this.localeData.weekdaysParse(input.dia === "SAB" ? "SÁB" : input.dia, "number", false);
      dias.push({ ...input, ...{ diaSemana } });
    }

    if (/SEGaDOM/.test(input.dia)) {
      for (let index = 0; index <= 6; index++) {
        dias.push({ ...input, ...{ diaSemana: index } });
      }
    }

    if (/a/.test(input.dia) || /e/.test(input.dia)) {
      const diaSemadaE = input.dia.split(/e/);

      diaSemadaE.map((dia) => {
        if (dia.length === 3) {
          const diaSemana = this.localeData.weekdaysParse(dia === "SAB" ? "SÁB" : dia, "number", false);
          dias.push({ ...input, ...{ diaSemana } });
        } else {
          if (dia.split(/a/).length !== 0) {
            const [inicio, fim] = dia.split(/a/);

            const primeiro = this.localeData.weekdaysParse(inicio === "SAB" ? "SÁB" : inicio, "number", false);
            const ultimo = this.localeData.weekdaysParse(fim === "SAB" ? "SÁB" : fim, "number", false);

            for (let index = primeiro; index <= ultimo; index++) {
              dias.push({ ...input, ...{ diaSemana: index } });
            }
          }
        }
      });
    }

    return dias;
  }
}
