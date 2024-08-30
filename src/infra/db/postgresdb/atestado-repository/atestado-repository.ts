import { PrismaClient } from "@prisma/client";

import { AddAtestado, AddAtestadoModel } from "../../../../domain/usecases/add-atestado";
import { ComprimentoDeArray, DataAtestadoInvalida, FormatoArray } from "../../../../presentation/errors/Funcionario-param-error";
import { prisma } from "../../../database/Prisma";
import moment from "moment";

export class AtestadoRepository implements AddAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: AddAtestadoModel): Promise<boolean> {
    const prisma = this.prisma;

    try {
      // Converte horários de strings para arrays, se necessário
      const horarioTrabalhadoInicio: string[] =
        (typeof input.horario_trabalhado_inicio === "string"
          ? (input.horario_trabalhado_inicio as string).split(",")
          : input.horario_trabalhado_inicio) || [];

      const horarioTrabalhadoFim: string[] =
        (typeof input.horario_trabalhado_fim === "string"
          ? (input.horario_trabalhado_fim as string).split(",")
          : input.horario_trabalhado_fim) || [];

      // Inicia uma transação para garantir que todas as operações sejam atômicas
      const result = await prisma.$transaction(async (transaction) => {
        // Verificar a primeira data no cartao_dia do funcionário
        const primeiroDiaCartao = await transaction.cartao_dia.findFirst({
          where: {
            cartao: {
              funcionarioId: input.funcionarioId,
            },
          },
          orderBy: {
            data: "asc",
          },
          select: {
            data: true,
          },
        });

        // Log da data do cartão
        console.log("Data do primeiro dia do cartão:", primeiroDiaCartao?.data);

        // Lança um erro se a data do atestado for anterior à primeira data de registro
        if (primeiroDiaCartao && new Date(input.data) < new Date(primeiroDiaCartao.data)) {
          throw new DataAtestadoInvalida(
            "A data do atestado não pode ser anterior à primeira data de registro no cartão do funcionário.",
          );
        }

        // Cria o atestado
        const savedAtestado = await transaction.atestado_funcionario.create({
          data: {
            data: moment.utc(input.data).toDate(),
            inicio: moment.utc(input.inicio).toDate(),
            fim: moment.utc(input.fim).toDate(),
            descricao: input.descricao,
            userName: input.userName,
            acidente_trabalho: input.acidente_trabalho,
            acao: input.acao,
            idade_paciente: input.idade_paciente,
            grupo_cid: input.grupo_cid,
            tipoAcompanhanteId: input.tipoAcompanhanteId,
            funcionarioId: input.funcionarioId,
            ocupacaoId: input.ocupacaoId,
            tipoGrauParentescoId: input.tipoGrauParentescoId,
            tipoId: input.tipoId,
            tipo_comprovanteId: input.tipo_comprovanteId,
            sintomas: input.sintomas,
            trabalhou_dia: input.trabalhou_dia,
            exame: input.exame,
            observacao: input.observacao,
            nome_acompanhante: input.nome_acompanhante,
            statusId: 1,
            funcionarioFuncaoId: input.funcionarioFuncaoId,
            nomeFuncionario: input.nomeFuncionario,
            crm: input.crm,
            createAt: moment().utc(true).toDate(),
            updateAt: moment().utc(true).toDate(),
          },
        });

        // Verifica se os arrays de horários estão definidos e têm o mesmo comprimento
        if (Array.isArray(horarioTrabalhadoInicio) && Array.isArray(horarioTrabalhadoFim)) {
          console.log("horarioTrabalhadoInicio:", horarioTrabalhadoInicio);
          console.log("horarioTrabalhadoFim:", horarioTrabalhadoFim);
          if (horarioTrabalhadoInicio.length !== horarioTrabalhadoFim.length) {
            throw new ComprimentoDeArray("Os horários de início e fim devem ter o mesmo comprimento.");
          }

          // Cria os registros de entradas e saídas
          const entradasSaidasPromises = horarioTrabalhadoInicio.map((inicio, index) => {
            return transaction.entradas_saidas_atestado.create({
              data: {
                atestadoId: savedAtestado.id,
                entrada: inicio,
                saida: horarioTrabalhadoFim[index],
              },
            });
          });

          await Promise.all(entradasSaidasPromises);
        } else {
          throw new FormatoArray("Os horários de início e fim devem estar definidos como arrays.");
        }

        return savedAtestado;
      });

      return !!result;
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        throw error;
      }
      if (error instanceof ComprimentoDeArray) {
        throw error;
      }
      if (error instanceof FormatoArray) {
        throw error;
      }
      console.error("Erro ao criar atestado:", error);
      throw new Error("Erro ao criar atestado.");
    }
  }

  public async findFisrtFuncionario(input: { id: number }): Promise<{ nome: string; funcaoId: number } | undefined> {
    try {
      const funcionario = await this.prisma.funcionario.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!funcionario) return undefined;
      return {
        nome: funcionario.nome,
        funcaoId: funcionario.funcaoId,
      };
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        throw error;
      }
      console.error("Erro ao buscar funcionário:", error);
      throw new Error("Erro ao buscar funcionário.");
    }
  }
}
export { ComprimentoDeArray, DataAtestadoInvalida, FormatoArray };
