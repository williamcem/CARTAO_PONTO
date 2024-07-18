import { PrismaClient } from "@prisma/client";

import { AddAtestado, AddAtestadoModel } from "../../../../domain/usecases/add-atestado";
import { prisma } from "../../../database/Prisma";

export class AtestadoRepository implements AddAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: AddAtestadoModel): Promise<boolean> {
    try {
      const savedAtestado = await this.prisma.atestado_funcionario.create({
        data: {
          data: input.data,
          inicio: input.inicio,
          fim: input.fim,
          descricao: input.descricao,
          userName: input.userName,
          acidente_trabalho: input.acidente_trabalho,
          acao: input.acao,
          idade_paciente: input.idade_paciente,
          grupo_cid: input.grupo_cid,
          tipoAcompanhanteId: input.tipoAcompanhanteId,
          funcionarioId: input.funcionarioId,
          ocupacaoId: input.ocupacaoId,
          tipoId: input.tipoId,
          statusId: 1,
        },
      });

      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao criar atestado:", error);
      return false;
    }
  }
}
