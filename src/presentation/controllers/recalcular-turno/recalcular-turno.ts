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
  public inicioNoturno = { hora: 22, minuto: 0 };
  public fimNoturno = { hora: 5, minuto: 0 };

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
        cargaHorariaNoturna: number;
        cargaHorariaCompleta: string;
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

      return ok({ message: dias, errors });
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
      cargaHorariaNoturna: number;
      cargaHorariaCompleta: string;
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
          cargaHorariaNoturna: number;
          cargaHorariaCompleta: string;
        } = {
          cargaHoraria: 0,
          cargaHorariaPrimeiroPeriodo: 0,
          cargaHorariaSegundoPeriodo: 0,
          periodoDescanso: 0,
          cargaHorariaNoturna: 0,
          cargaHorariaCompleta: "",
        };

        const horariosDoDia = horariosPorSemana[dia];

        localOutput.periodoDescanso = this.localizarPeriodoDescanso({ horarios: horariosDoDia });
        localOutput.cargaHorariaPrimeiroPeriodo = this.localizarPrimeiroPeriodo({ horarios: horariosDoDia });
        localOutput.cargaHorariaSegundoPeriodo = this.localizarSegundoPeriodo({ horarios: horariosDoDia });
        localOutput.cargaHoraria = localOutput.cargaHorariaPrimeiroPeriodo + localOutput.cargaHorariaSegundoPeriodo;
        localOutput.cargaHorariaNoturna = this.localizarCargaHorariaNoturna({ horarios: horariosDoDia });
        localOutput.cargaHorariaCompleta = this.gerarCargaHorariaCompleta({
          horarios: horariosDoDia,
          periodoDescanso: localOutput.periodoDescanso,
        });

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

  private localizarCargaHorariaNoturna(input: { horarios: string[] }) {
    let minutos = 0;
    const [horaEntrada, minutoEntrada] = input.horarios[0].split(":");
    const [horaSaida, minutoSaida] = input.horarios[1].split(":");

    const inicio = moment()
      .utc()
      .set({
        h: Number(horaEntrada),
        m: Number(minutoEntrada),
      });
    const fim = moment()
      .utc()
      .set({
        h: Number(horaSaida),
        m: Number(minutoSaida),
      });
    minutos =
      minutos + this.localizarMinutosNoturno({ fim: fim.toDate(), inicio: inicio.toDate(), data: inicio.toDate() }).minutos;

    //2º Periodo se houver
    if (input.horarios.length === 4) {
      const [horaEntrada, minutoEntrada] = input.horarios[2].split(":");
      const [horaSaida, minutoSaida] = input.horarios[3].split(":");

      const inicioSegundo = moment()
        .utc()
        .set({
          h: Number(horaEntrada),
          m: Number(minutoEntrada),
        });

      const fimSegundo = moment()
        .utc()
        .set({
          h: Number(horaSaida),
          m: Number(minutoSaida),
        });

      if (inicio.isAfter(inicioSegundo)) inicioSegundo.add(1, "d");
      if (inicio.isAfter(fimSegundo)) fimSegundo.add(1, "d");

      minutos =
        minutos +
        this.localizarMinutosNoturno({ fim: fimSegundo.toDate(), inicio: inicioSegundo.toDate(), data: inicio.toDate() }).minutos;
    }

    return minutos;
  }

  public localizarMinutosNoturno(input: { data: Date; inicio: Date; fim: Date }) {
    const output = {
      minutos: 0,
      inicio: undefined,
      final: undefined,
      tipo: 0, //0-Sem tratamento, 1-Todo periodo, 2-Antes
    };

    const inicioHorarioNoturno = moment.utc(input.data).set({
      minute: this.inicioNoturno.minuto,
      hour: this.inicioNoturno.hora,
      second: -1,
    });

    const fimHorarioNoturno = moment.utc(input.data).set({
      minute: this.fimNoturno.minuto,
      hour: this.fimNoturno.hora,
      second: 1,
    });

    const inicioHorarioNoturnoAnterior = moment.utc(input.data).set({
      minute: this.inicioNoturno.minuto,
      hour: this.inicioNoturno.hora,
      second: -1,
      days: -1,
    });

    const fimHorarioNoturnoAnterior = moment.utc(input.data).set({
      minute: this.fimNoturno.minuto,
      hour: this.fimNoturno.hora,
      second: 1,
    });

    fimHorarioNoturno.add(1, "day");

    //Noturno dia atual
    {
      //Se o horario inicio e fim está completamente dentro do horario noturno
      {
        const inicioEstaEntreNoturno = moment.utc(input.inicio).isBetween(inicioHorarioNoturno, fimHorarioNoturno);
        const fimEstaEntreNoturno = moment.utc(input.fim).isBetween(inicioHorarioNoturno, fimHorarioNoturno);

        if (inicioEstaEntreNoturno && fimEstaEntreNoturno)
          return { minutos: moment(input.fim).diff(input.inicio, "minutes"), inicio: input.inicio, final: input.fim };
      }

      //O fim termina com horario noturno
      {
        const estaNoFim = moment.utc(input.fim).isBetween(inicioHorarioNoturno, fimHorarioNoturno);

        if (estaNoFim)
          return {
            minutos: moment.utc(input.fim).diff(inicioHorarioNoturno, "minutes"),
            inicio: inicioHorarioNoturno.add(1, "second").toDate(),
            final: input.fim,
          };
      }

      //Inicia com horario noturno e termina após horario noturno
      {
        const inicioEntre = moment.utc(input.inicio).isBetween(inicioHorarioNoturno, fimHorarioNoturno);
        const fimDepois = moment.utc(input.fim).isAfter(fimHorarioNoturno);

        if (inicioEntre && fimDepois)
          return {
            minutos: moment.utc(fimHorarioNoturno).diff(input.inicio, "minutes"),
            inicio: input.inicio,
            final: fimHorarioNoturno.subtract(1, "second").toDate(),
          };
      }
    }

    //Noturno dia anterior
    {
      //Se o horario inicio e fim está completamente dentro do horario noturno
      {
        const inicioEstaEntreNoturno = moment
          .utc(input.inicio)
          .isBetween(inicioHorarioNoturnoAnterior, fimHorarioNoturnoAnterior);
        const fimEstaEntreNoturno = moment.utc(input.fim).isBetween(inicioHorarioNoturnoAnterior, fimHorarioNoturnoAnterior);

        if (inicioEstaEntreNoturno && fimEstaEntreNoturno)
          return { minutos: moment(input.fim).diff(input.inicio, "minutes"), inicio: input.inicio, final: input.fim };
      }

      //O fim termina com horario noturno
      {
        const estaNoFim = moment.utc(input.fim).isBetween(inicioHorarioNoturnoAnterior, fimHorarioNoturnoAnterior);

        if (estaNoFim)
          return {
            minutos: moment.utc(input.fim).diff(inicioHorarioNoturnoAnterior, "minutes"),
            inicio: inicioHorarioNoturnoAnterior.add(1, "second").toDate(),
            final: input.fim,
          };
      }

      //Inicia com horario noturno e termina após horario noturno
      {
        const inicioEntre = moment.utc(input.inicio).isBetween(inicioHorarioNoturnoAnterior, fimHorarioNoturnoAnterior);
        const fimDepois = moment.utc(input.fim).isAfter(fimHorarioNoturnoAnterior);

        if (inicioEntre && fimDepois)
          return {
            minutos: moment.utc(fimHorarioNoturnoAnterior).diff(input.inicio, "minutes"),
            inicio: input.inicio,
            final: fimHorarioNoturnoAnterior.subtract(1, "second").toDate(),
          };
      }
    }

    return output;
  }

  public gerarCargaHorariaCompleta(input: { horarios: string[]; periodoDescanso: number }) {
    let output = "";
    for (let index = 0; index <= 3; index++) {
      const horario = input.horarios[index];

      let value = "";
      if (horario) value = `${horario.replace(":", ".")}`;
      else value = `00.00`;

      output = `${output}${value};`;
    }

    let horas = Math.floor(input.periodoDescanso / 60); // Calcula as horas inteiras
    let restoMinutos = input.periodoDescanso % 60; // Calcula os minutos restantes

    const periodoDescanso = `${horas.toString().padStart(2, "0")}.${restoMinutos.toString().padStart(2, "0")}`;

    output = `${output}${periodoDescanso}`;

    return output;
  }

  private montarDiasDaSemana(input: {
    dia: string;
    cargaHoraria: number;
    cargaHorariaPrimeiroPeriodo: number;
    cargaHorariaSegundoPeriodo: number;
    periodoDescanso: number;
    cargaHorariaNoturna: number;
    cargaHorariaCompleta: string;
  }) {
    const dias: {
      diaSemana: number;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      periodoDescanso: number;
      cargaHorariaNoturna: number;
      cargaHorariaCompleta: string;
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
