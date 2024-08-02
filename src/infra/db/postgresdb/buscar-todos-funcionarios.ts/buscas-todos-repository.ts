import { PrismaClient } from "@prisma/client";

import { BuscraTodosRepository } from "../../../../data/usecase/buscar-todos-funcionários/add-buscar-todos-funcionarios";
import { GetTodosFuncionariosModel } from "../../../../domain/models/buscar-todos-funcionarios";
import { BuscarTodosFuncionarios } from "../../../../presentation/controllers/buscar-todos-funcionarios/buscar-todos-protocols";
import { prisma } from "../../../database/Prisma";

export class BuscarTodosPostgresRepository implements BuscraTodosRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async listAll(funcionarioData: BuscarTodosFuncionarios) {
    try {
      const funcionarios = await this.prisma.funcionario.findMany({
        include: {
          turno: true, // Inclui a tabela 'turno' nos resultados
          localidade: true,
          centro_custo: true,
          funcao: true,
          contatos: true,
          emails: true,
          endereco: true,
          afastamento: {
            include: { funcionarios_afastados_status: true },
          },
          cartao: { include: { cartao_dia: { include: { cartao_dia_lancamentos: true } } } },
        },
        where: {
          identificacao: { endsWith: funcionarioData.identificacao },
          localidadeId: funcionarioData.localidade?.codigo,
        },
      });

      // Mapeia os resultados para incluir periodoDeTrabalho com o campo renomeado
      return funcionarios.map((funcionario) => ({
        ...funcionario,
        periodoDeTrabalho: {
          id: funcionario.turno.id,
          descricaoDoTurno: funcionario.turno.nome, // Renomeia o campo 'nome' para 'periodo'
        },
        turno: undefined, // Remove o campo turno original
      }));
    } catch (error) {
      console.error("Erro ao buscar funcionários", error);
      throw error;
    }
  }

  public async findFisrtAtestado(input: { cartaoDiaId: number; funcionarioId: number }) {
    const result = await this.prisma.atestado_abono.findFirst({
      where: {
        cartaoDiaId: input.cartaoDiaId,
        atestado_funcionario: { funcionarioId: input.funcionarioId },
      },
    });

    if (!result) return undefined;

    return result;
  }
}
