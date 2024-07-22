import { PrismaClient } from "@prisma/client";

import { AddAtestado, AddAtestadoModel } from "../../../../domain/usecases/add-atestado";
import { prisma } from "../../../database/Prisma";

export class DataAtestadoInvalida extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAtestadoInvalida";
  }
}

export class AtestadoRepository implements AddAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: AddAtestadoModel): Promise<boolean> {
    try {
      // Verificar a primeira data no cartao_dia do funcionário
      const primeiroDiaCartao = await this.prisma.cartao_dia.findFirst({
        where: {
          cartao: {
            funcionarioId: input.funcionarioId,
          },
          // Acrescentar verificação de sttaus do cartão, se estiver importado faz os fechados não
        },
        orderBy: {
          data: "asc",
        },
        select: {
          data: true,
        },
      });

      // Análise de data de comparação
      console.log("Data achada:", primeiroDiaCartao?.data);
      console.log("Data de cadastro:", input.data);

      // Lança um erro se a data do atestado for anterior à primeira data de registro
      if (primeiroDiaCartao && new Date(input.data) < new Date(primeiroDiaCartao.data)) {
        throw new DataAtestadoInvalida(
          "A data do atestado não pode ser anterior à primeira data de registro no cartão do funcionário.",
        );
      }

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
          sintomas: input.sintomas,
          statusId: 1,
        },
      });

      return !!savedAtestado;
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        throw error;
      }
      console.error("Erro ao criar atestado:", error);
      throw new Error("Erro ao criar atestado.");
    }
  }
}
