import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helpers";

interface HorariosRequestBody {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
  saldoAnt?: number;
}

export interface HorarioData {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min: number;
  saldoAnt: number;
}

export class HorariosController implements Controller {
  private readonly addHorarios: AddHorarios;

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
  }

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const camposRequiridos: Array<string> = ["id", "entradaManha", "saidaManha"];
      const { id, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra } =
        httRequest.body as HorariosRequestBody;

      for (const campo of camposRequiridos) {
        if (!httRequest.body[campo as keyof HorariosRequestBody]) {
          return badRequest(new MissingParamError(campo));
        }
      }

      const lastHorario = await this.getLastHorario();

      let totalManhaMin = this.calcularTotalMinutos(entradaManha, saidaManha);
      let totalTardeMin = 0;

      if (entradaTarde && saidaTarde) {
        totalTardeMin = this.calcularTotalMinutos(entradaTarde, saidaTarde);
      }

      let totalExtramin = 0;

      if (entradaExtra && saidaExtra) {
        totalExtramin = this.calcularTotalMinutos(entradaExtra, saidaExtra);
      }

      const totalDiaMin = totalManhaMin + totalTardeMin + totalExtramin;
      const escalaDiariaMin = 8.8 * 60;
      const saldoDiaMin = totalDiaMin - escalaDiariaMin;
      const saldoDiaMinInteiro = Math.round(saldoDiaMin);

      let saldoAntAtual = 0;

      if (lastHorario) saldoAntAtual = lastHorario.saldoAnt + saldoDiaMinInteiro;

      const horarioData: HorarioData = {
        id,
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        entradaExtra,
        saidaExtra,
        dif_min: saldoDiaMinInteiro,
        saldoAnt: saldoAntAtual,
      };

      const horario = await this.addHorarios.add(horarioData);

      return ok(horario);
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }

  private async getLastHorario(): Promise<HorarioData | null> {
    try {
      const lastHorario = await this.addHorarios.getLastHorario();

      if (lastHorario) {
        return lastHorario;
      }

      return null;
    } catch (error) {
      throw new Error("Erro ao buscar o último horário");
    }
  }

  private calcularTotalMinutos(entrada: string, saida: string, extra?: string): number {
    const [entradaHoras, entradaMinutos] = entrada.split(":").map(Number);
    const [saidaHoras, saidaMinutos] = saida.split(":").map(Number);

    let totalMinutosEntrada = entradaHoras * 60 + entradaMinutos;
    let totalMinutosSaida = saidaHoras * 60 + saidaMinutos;

    if (extra) {
      const [extraHoras, extraMinutos] = extra.split(":").map(Number);
      totalMinutosSaida += extraHoras * 60 + extraMinutos;
    }

    return totalMinutosSaida - totalMinutosEntrada;
  }
}
