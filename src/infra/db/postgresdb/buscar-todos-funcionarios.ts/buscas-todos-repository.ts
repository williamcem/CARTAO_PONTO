import { PrismaClient } from "@prisma/client";
import { BuscraTodosRepository } from "../../../../data/usecase/buscar-todos-funcionários/add-buscar-todos-funcionarios";
import { GetTodosFuncionariosModel } from "../../../../domain/models/buscar-todos-funcionarios";
import { prisma } from "../../../database/Prisma";
import { BuscarTodosFuncionarios } from "../../../../presentation/controllers/buscar-todos-funcionarios/buscar-todos-protocols";

export class BuscarTodosPostgresRepository implements BuscraTodosRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async listAll(funcionarioData: BuscarTodosFuncionarios): Promise<GetTodosFuncionariosModel[]> {
    try {
      const funcionarios = await this.prisma.funcionario.findMany({
        include: {
          turno: true, // Inclui a tabela 'turno' nos resultados
          localidade: true,
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
          descricacoDoTurno: funcionario.turno.nome, // Renomeia o campo 'nome' para 'periodo'
        },
        turno: undefined, // Remove o campo turno original
      }));
    } catch (error) {
      console.error("Erro ao buscar funcionários", error);
      throw error;
    }
  }
}