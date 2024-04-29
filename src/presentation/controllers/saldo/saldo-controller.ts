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
        let dif_min = dia.dif_min;

        if (saldoAtual > 0) {
          if (dif_min < 0) dif_min = dif_min / 1.6;
        }
        saldoAtual = saldoAtual + dif_min;

        // Arredonda a parte decimal de saldoAtual
        saldoAtual = arredondarParteDecimal(saldoAtual);

        // Verificar se dif_min está entre -10 e 10
        if (dif_min >= -10 && dif_min <= 10) {
          continue; // Pula para a próxima iteração do loop
        }

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

// Função para arredondar apenas a parte decimal de um número
function arredondarParteDecimal(numero: number): number {
  const inteiro = Math.floor(numero); // Obtém a parte inteira do número
  const decimal = numero - inteiro; // Obtém a parte decimal do número

  // Se a parte decimal for maior que 0.5, arredonde para cima
  if (decimal > 0.5) {
    return inteiro + 1; // Adiciona 1 para arredondar para cima
  } else {
    return inteiro; // Mantém o inteiro, arredondando para baixo
  }
}
