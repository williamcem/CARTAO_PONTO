import { HttpRequest, HttpResponse, Controller } from "./horarios-protocols";
import { AddHorarios } from "../../../domain/usecases/add-horarios";
import { serverError, ok, badRequest } from "../../../presentation/helpers/http-helpers";
import { ExtraParamError } from "../../errors/extra-erro";
import { TardeParamError } from "../../errors/tarde-erro";
import { ManhaParamError } from "../../errors/manha-erro";

export interface HorarioData {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string;
  saidaTarde: string;
  entradaExtra: string;
  saidaExtra: string;
  dif_min: number;
}

export class HorariosController implements Controller {
  private readonly addHorarios: AddHorarios;

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra } = httpRequest.body;

      // Verificação para entradaTarde e saidaTarde
      if ((entradaManha && !saidaManha) || (!entradaManha && saidaManha)) {
        return badRequest(new ManhaParamError("Se entradaManha ou saidaManha for fornecido, ambos devem estar presentes."));
      }

      if ((entradaTarde && !saidaTarde) || (!entradaTarde && saidaTarde)) {
        return badRequest(new TardeParamError("Se entradaTarde ou saidaTarde for fornecido, ambos devem estar presentes."));
      }

      // Verificação para entradaExtra e saidaExtra
      if ((entradaExtra && !saidaExtra) || (!entradaExtra && saidaExtra)) {
        return badRequest(new ExtraParamError("Se entradaExtra ou saidaExtra for fornecido, ambos devem estar presentes."));
      }

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
      const escalaDiariaMin = 8.8 * 60; // 8 horas e 48 minutos em minutos
      let dif_min = totalDiaMin - escalaDiariaMin;

      // Ajustar dif_min para 0 se estiver dentro do intervalo -10 e 10
      if (dif_min >= -10 && dif_min <= 10) {
        dif_min = 0;
      }

      const horarioData = {
        id,
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        entradaExtra,
        saidaExtra,
        dif_min: 0,
      };

      const horario = await this.addHorarios.add(horarioData);

      return ok({ dif_min: horario.dif_min, horarioData });
    } catch (error) {
      -console.log(error);
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
