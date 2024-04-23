import { SaldoAntServico } from "./saldoAntServico";
import { SaldoAntRepository } from "../../../infra/db/postgresdb/horarios-repository/saldoAnt";
import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { TardeParamError } from "../../errors/tarde-erro"
import { badRequest, serverError, ok } from "../../helpers/http-helpers";
import { HorariosPostgresRepository } from "../../../infra/db/postgresdb/horarios-repository/horarios";

interface HorariosRequestBody {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
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
  private readonly saldoAntService: SaldoAntServico;
  private readonly saldoAntRepository: SaldoAntRepository;
  private readonly horariosRepository: HorariosPostgresRepository;

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
    this.saldoAntService = new SaldoAntServico();
    this.saldoAntRepository = new SaldoAntRepository();
    this.horariosRepository = new HorariosPostgresRepository();
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const camposRequiridos: Array<string> = ["id", "entradaManha", "saidaManha"];
      const { id, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra } =
        httpRequest.body as HorariosRequestBody;

      for (const campo of camposRequiridos) {
        if (!httpRequest.body[campo as keyof HorariosRequestBody]) {
          return badRequest(new MissingParamError(campo));
        }
      }

      // Verificação para entradaTarde e saidaTarde
      if ((entradaTarde && !saidaTarde) || (!entradaTarde && saidaTarde)) {
        return badRequest(new TardeParamError("Se entradaTarde ou saidaTarde fornecido, ambos devem estar presentes."));
      }

      const lastHorario = await this.horariosRepository.getLastHorario();

      let totalManhaMin = this.calcularTotalMinutos(entradaManha, saidaManha);
      let totalTardeMin = 0;

      if (entradaTarde && saidaTarde) {
        totalTardeMin = this.calcularTotalMinutos(entradaTarde, saidaTarde);
      }

      let totalExtraMin = 0;

      if (entradaExtra && saidaExtra) {
        totalExtraMin = this.calcularTotalMinutos(entradaExtra, saidaExtra);
      }

      const totalDiaMin = totalManhaMin + totalTardeMin + totalExtraMin;
      const escalaDiariaMin = 8.8 * 60;
      const saldoDiaMin = totalDiaMin - escalaDiariaMin;
      const saldoDiaMinInteiro = Math.round(saldoDiaMin);

      const saldoAntAtual = lastHorario ? lastHorario.saldoAnt : 0;
      const novoSaldoAnt = this.saldoAntService.calcularSaldoAnt(saldoAntAtual || 0, saldoDiaMinInteiro);

      await this.saldoAntRepository.updateSaldoAnt(id, novoSaldoAnt);

      const horarioData: HorarioData = {
        id,
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        entradaExtra,
        saidaExtra,
        dif_min: saldoDiaMinInteiro,
        saldoAnt: novoSaldoAnt,
      };

      const horario = await this.addHorarios.add(horarioData);

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

    if (extra) {
      const [extraHoras, extraMinutos] = extra.split(":").map(Number);
      totalMinutosSaida += extraHoras * 60 + extraMinutos;
    }

    return totalMinutosSaida - totalMinutosEntrada;
  }
}
