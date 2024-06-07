import { PrismaClient } from "@prisma/client";

import { AddAfastados, AddAfastadosUpasertmodel } from "../../../../domain/usecases/add-afastados";
import { prisma } from "../../../database/Prisma";

export class AfastamentoRepository implements AddAfastados {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: AddAfastadosUpasertmodel): Promise<boolean> {
    try {
      const savedAfastamento = await this.prisma.funcionarios_afastados.upsert({
        where: {
          inicio_funcionarioId_statusId: {
            funcionarioId: input.funcionarioId,
            inicio: input.inicio,
            statusId: input.status.id,
          },
        },
        create: {
          inicio: input.inicio,
          total: input.total,
          fim: input.fim,
          userName: input.userName,
          funcionarios_afastados_status: {
            connectOrCreate: {
              where: { id: input.status.id },
              create: { id: input.status.id, nome: input.status.nome },
            },
          },
          funcionario: { connect: { id: input.funcionarioId } },
        },
        update: {
          inicio: input.inicio,
          fim: input.fim,
          total: input.total,
          funcionario: { connect: { id: input.funcionarioId } },
          userName: input.userName,
          funcionarios_afastados_status: {
            connectOrCreate: {
              where: { nome: input.status.nome },
              create: { id: input.status.id, nome: input.status.nome },
            },
          },
        },
      });

      return !!savedAfastamento;
    } catch (error) {
      console.error("Erro ao criar afastamento:", error);
      return false;
    }
  }
}
