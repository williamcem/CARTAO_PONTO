import { HttpResponse, Controller } from "./saldo-protocols";
import { DbAddSaldoAnt } from "../../../data/usecase/saldoAnt/db-add-saldo-ant";
import { serverError, ok } from "../../../presentation/helpers/http-helpers";
import { prisma } from "../../../infra/database/Prisma";

export class SaldoController implements Controller {
  private readonly dbAddSaldoAnt: DbAddSaldoAnt;

  constructor(dbAddSaldoAnt: DbAddSaldoAnt) {
    this.dbAddSaldoAnt = dbAddSaldoAnt;
  }

  async handle(): Promise<HttpResponse> {
    try {
      const prismaClient = prisma;
      const dias = await prismaClient.dia.findMany({
        include: { receberdados: true },
        orderBy: { receberdados: { data: "asc" } },
      });

      let saldoAnterior = 0; // Inicializa o saldoAnt do primeiro dia

      let contador = 0;
      const date = new Date();
      date.setHours(20);
      date.setMinutes(59);
      date.setSeconds(59);

      for (const dia of dias) {
        if (date.getTime() < dia.receberdados.data.getTime()) continue;

        let dif_min = dia.dif_min;
        if (contador === 0) saldoAnterior = dia.receberdados.saldoanterior;

        // Verifica se deve dividir dif_min por 1.6
        if (saldoAnterior > 0 && dif_min < 0) {
          dif_min = dif_min / 1.6;
        }

        // Verifica se dif_min está no intervalo de -10 e 10
        if (dif_min >= -10 && dif_min <= 10) {
          // Não faz nenhuma alteração no saldoAnt
          dif_min = 0;
        }

        // Atualiza o saldoAtual com base no saldoAnterior
        let saldoAtual = saldoAnterior + dif_min;

        // Arredonda a parte decimal de saldoAtual
        saldoAtual = arredondarParteDecimal(saldoAtual);

        // Atualiza o saldoAnt apenas se dif_min estiver fora do intervalo
        await prismaClient.dia.update({
          where: { id: dia.id },
          data: { saldoAnt: saldoAtual }, // Atualiza o saldoAnt
        });

        // Atualiza o saldoAnterior para o próximo dia
        saldoAnterior = saldoAtual;
        contador++;
      }

      return ok({ message: "Saldo anterior calculado e adicionado com sucesso" });
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
}

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
