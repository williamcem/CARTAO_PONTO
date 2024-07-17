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
          inicio: input.inicio,
          fim: input.fim,
          descricao: input.descricao,
          userName: input.userName,
          acidente_trabalho: false,
          proprio: false,
          observacao: input.observacao,
          idade_paciente: input.idade_paciente,
          grupo_cid: input.grupo_cid,
          tipoAcompanhanteId: input.tipoAcompanhanteId,
          funcionarioId: input.funcionarioId,
          ocupacaoId: input.ocupacaoId,
          tipoId: input.tipoId,
          statusId: 1,


          // funcionario: { connect: { id: input.funcionarioId } },
          // tipos_documentos: { connect: { id: input.tipoId } },
          // tipo_ocupacao: { connect: { id: input.ocupacaoId } },
          // tipo_status: { connect: { id: 1 } },
        },
      });

      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao criar atestado:", error);
      return false;
    }
  }
}

/*    public async addLancamentos(input: AddAtestadoModel): Promise<{ atestadoSalvo: boolean; lancamentos: any[] }> {
    try {
      const lancamentos = await this.prisma.cartao_dia_lancamento.findMany({
        where: {
          cartao_dia: {
            data: input.data,
          },
        },
        include: {
          cartao_dia: true,
        },
      });

      const savedAtestado = await this.prisma.atestado_funcionario.create({
        data: {
          inicio: input.inicio,
          fim: input.fim,
          descricao: input.descricao,
          userName: input.userName,
          acidente_trabalho: false,
          proprio: false,
          funcionario: { connect: { identificacao: input.identificacao } },
          tipos_documentos: { connect: { id: input.tipoId } },
          tipo_ocupacao: { connect: { id: input.ocupacaoId } },
          tipo_acompanhante: { connect: { id: input.tipoAcompanhanteId } },
        },
      });

      return { atestadoSalvo: !!savedAtestado, lancamentos };
    } catch (error) {
      console.error("Erro ao criar atestado:", error);
      return { atestadoSalvo: false, lancamentos: [] };
    }
  }
}
*/
