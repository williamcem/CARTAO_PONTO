import { PrismaClient } from "@prisma/client";
import moment from "moment";

import { prisma } from "@infra/database/Prisma";

import { CriarEventoOnibus } from "../../../../data/usecase/add-evento-onibus/add-evento-onibus";
import { RecalcularTurnoController } from "../../../../presentation/controllers/recalcular-turno/recalcular-turno";

export class CriarEventoOnibusPostgresRepository implements CriarEventoOnibus {
  private prisma: PrismaClient;

  constructor(private readonly recalcularTurnoController: RecalcularTurnoController) {
    this.prisma = prisma;
  }

  // Buscar a primeira entrada do peirmeiro lançamento
  public async findLancamentoByCartaoDiaId(cartaoDiaId: number) {
    return await this.prisma.cartao_dia_lancamento.findFirst({
      where: {
        cartao_dia_id: cartaoDiaId,
        periodoId: 1, // Pegar periodo 1
      },
      include: {
        cartao_dia: {
          include: {
            cartao: {
              include: {
                funcionario: true,
              },
            },
          },
        },
      },
      orderBy: {
        entrada: "asc", // Ordena para pegar a priemira entrada do Dia
      },
    });
  }

  public async addOnibus(input: { id: number; entradaReal: Date }): Promise<boolean> {
    try {
      // Buscar o primeiro lançamento com base no id fornecido
      const lancamento = await this.findLancamentoByCartaoDiaId(input.id);

      if (!lancamento || !lancamento.entrada) {
        console.error("Lançamento de período 1 não encontrado.");
        return false;
      }

      const entradaLancamentoMoment = moment.utc(lancamento.entrada);
      const entradaRealMoment = moment.utc(input.entradaReal);

      // Criar o evento de comparação entre o horario lançado com o novo horario que o usuário digitar
      const evento = {
        cartaoDiaId: input.id,
        hora: this.ordenarHorario({ inicio: entradaLancamentoMoment, fim: entradaRealMoment }),
        minutos: Math.abs(entradaRealMoment.diff(entradaLancamentoMoment, "minutes")),
        inicio: entradaRealMoment.toDate(),
        fim: entradaLancamentoMoment.toDate(),
      };

      await this.prisma.evento_atraso_onibus.create({
        data: evento,
      });

      await this.recalcularTurnoController.handle({ body: { cartaoDiaId: input.id } });

      console.log("Evento criado com sucesso.");
      return true;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      return false;
    }
  }

  // Método para verificar se já existe um evento do tipoId fornecido
  public async findEventoByTipoIdAndCartaoDiaId(input: { id: number; tipoId: number }) {
    return await this.prisma.evento_atraso_onibus.findFirst({
      where: {
        cartaoDiaId: input.id,
      },
    });
  }

  ordenarHorario(input: { inicio: moment.Moment; fim: moment.Moment }): string {
    if (input.inicio.isBefore(input.fim)) {
      return `${input.inicio.format("HH:mm")} - ${input.fim.format("HH:mm")}`;
    }
    return `${input.fim.format("HH:mm")} - ${input.inicio.format("HH:mm")}`;
  }
}
