import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helpers";
import { randomUUID } from "crypto";

// Definindo uma interface para o objeto 'body'
interface HorariosRequestBody {
  data: string;
  entradaManha: string;
  entradaTarde: string;
  saidaManha: string;
  saidaTarde: string;
  entradaExtra?: string;
  saidaExtra?: string;
  saldoAnt?: number;
}

interface HorarioData {
  id: string;
  data: string;
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
  private saldoAnterior: number | undefined; // Variável para armazenar o saldo anterior

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
    /* this.saldoAnterior = 0; // Definindo um valor padrão */
  }

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const camposRequiridos: Array<string> = ["data", "entradaManha", "saidaManha", "entradaTarde", "saidaTarde"];

      if (httRequest.body.entradaExtra !== undefined) {
        camposRequiridos.push("entradaExtra");
      }
      if (httRequest.body.saidaExtra !== undefined) {
        camposRequiridos.push("saidaExtra");
      }

      for (const campo of camposRequiridos) {
        if (!httRequest.body[campo as keyof HorariosRequestBody]) {
          return badRequest(new MissingParamError(campo));
        }
      }

      const { data, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra, saldoAnt } =
        httRequest.body as HorariosRequestBody;

      let saldoAntAtual: number; // Variável para armazenar o saldo atual

      // Verificar se saldoAnt está presente no corpo da requisição
      if (saldoAnt !== undefined) {
        saldoAntAtual = saldoAnt; // Se estiver presente, usar o valor fornecido
      } else {
        // Se não estiver presente, recuperar do banco de dados (ou usar um valor padrão se não houver nenhum)
        saldoAntAtual = this.saldoAnterior !== undefined ? this.saldoAnterior : 0;
      }

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

      // Verificar se a diferença é maior que 10 ou menor que -10 para ajustar o saldo anterior
      if (saldoDiaMinInteiro > 10 || saldoDiaMinInteiro < -10) {
        saldoAntAtual += saldoDiaMinInteiro;
      }

      const horarioData: HorarioData = {
        id: randomUUID(),
        data,
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        entradaExtra,
        saidaExtra,
        dif_min: saldoDiaMinInteiro,
        saldoAnt: saldoAntAtual,
      };

      if (entradaExtra !== undefined && saidaExtra !== undefined) {
        horarioData["entradaExtra"] = entradaExtra;
        horarioData["saidaExtra"] = saidaExtra;
      }

      const horario = await this.addHorarios.add(horarioData);

      // Atualizar o saldo anterior para o novo saldo após a adição do horário
      this.saldoAnterior = saldoAntAtual;

      return ok(horario);
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }

  private calcularTotalMinutos(entrada: string, saida: string, extra?: string): number {
    const [entradaHoras, entradaMinutos] = entrada.split(":").map(Number);
    const [saidaHoras, saidaMinutos] = saida.split(":").map(Number);

    let totalMinutosEntrada = entradaHoras * 60 + entradaMinutos;
    let totalMinutosSaida = saidaHoras * 60 + saidaMinutos;

    // Se houver entradaExtra e ela não for undefined, adicione-a aos minutos de saída
    if (extra !== undefined) {
      const [extraHoras, extraMinutos] = extra.split(":").map(Number);
      totalMinutosSaida += extraHoras * 60 + extraMinutos;
    }

    return totalMinutosSaida - totalMinutosEntrada;
  }
}
