import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helpers";

// Definindo uma interface para o objeto 'body'
interface HorariosRequestBody {
  id: string;
  entradaManha: string;
  entradaTarde: string;
  saidaManha: string;
  saidaTarde: string;
  entradaExtra?: string;
  saidaExtra?: string;
  saldoAnt?: number;
}

export interface HorarioData {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string;
  saidaTarde: string;
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
      const camposRequiridos: Array<string> = ["id", "entradaManha", "saidaManha", "entradaTarde", "saidaTarde"];
      const { id, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra } =
        httRequest.body as HorariosRequestBody;

      // Verificação dos campos obrigatórios
      for (const campo of camposRequiridos) {
        if (!httRequest.body[campo as keyof HorariosRequestBody]) {
          return badRequest(new MissingParamError(campo));
        }
      }

      // Consultar o banco de dados para obter o saldoAnt do último registro
      const lastHorario = await this.getLastHorario();

      let saldoAntAtual: number;

      let totalExtramin = 0;

      if (entradaExtra !== undefined && saidaExtra !== undefined) {
        totalExtramin = this.calcularTotalMinutos(entradaExtra, saidaExtra);
      }

      const totalManhaMin = this.calcularTotalMinutos(entradaManha, saidaManha);
      const totalTardeMin = this.calcularTotalMinutos(entradaTarde, saidaTarde);
      const totalDiaMin = totalManhaMin + totalTardeMin + totalExtramin;
      const escalaDiariaMin = 8.8 * 60;
      const saldoDiaMin = totalDiaMin - escalaDiariaMin;
      const saldoDiaMinInteiro = Math.round(saldoDiaMin);

      saldoAntAtual = 0;

      if (lastHorario) saldoAntAtual = lastHorario.saldoAnt + saldoDiaMinInteiro; // Usar o saldoAnt do último registro

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

      // Atualizar o saldo anterior para o novo saldo após a adição do horário

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

    if (extra !== undefined) {
      const [extraHoras, extraMinutos] = extra.split(":").map(Number);
      totalMinutosSaida += extraHoras * 60 + extraMinutos;
    }

    return totalMinutosSaida - totalMinutosEntrada;
  }
}
