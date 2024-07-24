import { PrismaClient } from "@prisma/client";

import { ListarFilial } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarFilialRepsository implements ListarFilial {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Corrigido para retornar uma lista de filiais
  public async listFilial(): Promise<{ filial: string }[]> {
    return await this.prisma.funcionario.findMany({
      distinct: ["filial"],
      select: {
        filial: true,
      },
    });
  }

  // Novo método para listar por localidade
  public async listByLocalidade(
    localidade: string,
  ): Promise<{ id: number; identificacao: string; nome: string; funcao: string }[]> {
    return await this.prisma.funcionario
      .findMany({
        where: {
          localidadeId: localidade,
        },
        select: {
          id: true,
          identificacao: true,
          nome: true,
          funcao: {
            select: {
              nome: true,
            },
          },
        },
      })
      .then((funcionarios) =>
        funcionarios.map((func) => ({
          id: func.id,
          identificacao: func.identificacao,
          nome: func.nome,
          funcao: func.funcao.nome,
        })),
      );
  }
}
