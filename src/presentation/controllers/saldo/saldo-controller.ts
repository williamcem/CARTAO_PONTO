import { PrismaClient } from "@prisma/client";
import { HttpRequest, HttpResponse, Controller } from "./saldo-protocols";
import { DbAddSaldoAnt } from "../../../data/usecase/saldoAnt/db-add-saldo-ant";
import { serverError, ok } from "../../../presentation/helpers/http-helpers";

export class SaldoController implements Controller {
  private readonly dbAddSaldoAnt: DbAddSaldoAnt;

  constructor(dbAddSaldoAnt: DbAddSaldoAnt) {
    this.dbAddSaldoAnt = dbAddSaldoAnt;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const prismaClient = new PrismaClient();
      const dias = await prismaClient.dia.findMany({
        include: { receberdados: true },
        orderBy: { receberdados: { data: "asc" } },
      });

      let saldoAtual = 0;
      for (const dia of dias) {
        //190
        let dif_min = dia.dif_min;

        // Verificar se dif_min está entre -10 e 10
        if (dif_min >= -10 && dif_min <= 10) {
          continue; // Pula para a próxima iteração do loop
        }

        if (saldoAtual > 0) {
          if (dif_min < 0) dif_min = dif_min / 1.6;
        }
        saldoAtual = saldoAtual + dif_min;

        // Arredonda saldoAtual para o valor inteiro mais próximo
        saldoAtual = Math.round(saldoAtual);

        const saved = await prismaClient.dia.update({ where: { id: dia.id }, data: { saldoAnt: saldoAtual } });
        console.log(saldoAtual);
      }

      return ok({ message: "Saldo anterior calculado e adicionado com sucesso" });
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
}
