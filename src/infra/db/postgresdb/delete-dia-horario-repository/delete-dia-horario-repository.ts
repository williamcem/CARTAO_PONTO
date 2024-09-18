import { PrismaClient } from "@prisma/client";

import { DelDeleteRepository } from "../../../../data/usecase/delete-dia-horarios/add-delete-repository";
import { DelDeleteModel } from "../../../../domain/usecases/delete-dia-horarios";
import { prisma } from "../../../database/Prisma";

export class DeletePostgresRepository implements DelDeleteRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Deletar lançamentos e eventos associados ao dia do cartão
  async deleteById(deleteData: DelDeleteModel): Promise<boolean> {
    try {
      const { cartao_dia_id } = deleteData;

      // Buscar o cartao_dia e o cartao associado
      const cartaoDia = await this.prisma.cartao_dia.findUnique({
        where: { id: cartao_dia_id },
        include: { cartao: true }, // Inclui o cartao para verificar o statusId
      });

      // Verificar se o cartaoDia foi encontrado
      if (!cartaoDia) {
        console.error("Dia do cartão não encontrado");
        return false; // Retorna falso se o dia do cartão não for encontrado
      }

      // Verificar o status do cartão antes de excluir os lançamentos e eventos
      if (cartaoDia.cartao.statusId !== 1) {
        console.error("Impossível deletar registros de um cartão finalizado");
        return false; // Retorna falso se o cartão estiver finalizado
      }

      // Deletar os lançamentos relacionados ao dia do cartão, mas manter o cartao_dia
      await this.prisma.cartao_dia_lancamento.deleteMany({
        where: { cartao_dia_id },
      });

      // Deletar os eventos relacionados ao dia do cartão, mas manter o cartao_dia
      await this.prisma.eventos.deleteMany({
        where: { cartaoDiaId: cartao_dia_id },
      });

      return true; // Retorna true se a exclusão for bem-sucedida
    } catch (error) {
      console.error("Erro ao deletar registros associados ao dia do cartão:", error);
      throw new Error("Erro ao tentar deletar os registros associados ao dia do cartão");
    }
  }

  // Método para buscar o cartao_dia e o cartao associado
  async findCartaoDiaById(deleteData: DelDeleteModel): Promise<boolean> {
    try {
      const { cartao_dia_id } = deleteData;

      const cartaoDia = await this.prisma.cartao_dia.findUnique({
        where: { id: cartao_dia_id },
        include: { cartao: true }, // Inclui o cartao para verificar o statusId
      });

      // Verificar se o cartaoDia foi encontrado
      if (!cartaoDia) {
        console.error("Dia do cartão não encontrado");
        return false;
      }

      console.log(cartaoDia); // Retorna ou manipula o cartaoDia encontrado
      return true;
    } catch (error) {
      console.error("Erro ao buscar dia do cartão:", error);
      throw new Error("Erro ao buscar dia do cartão");
    }
  }
}
