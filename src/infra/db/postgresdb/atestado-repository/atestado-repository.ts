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
          nome_funcionario: input.nome_funcionario,
          identificacao: input.identificacao,
          inicio: input.inicio,
          fim: input.fim,
          saida: input.saida || null,
          retorno: input.retorno || null,
          tipo: input.tipo,
          grupo_cid: input.grupo_cid,
          descricao: input.descricao,
          userName: input.userName,
          funcionario: { connect: { identificacao: input.identificacao } }, // Certifique-se de que funcionarioId é fornecido
        },
      });

      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao criar atestado:", error);
      return false;
    }
  }
}
