import { PrismaClient } from "@prisma/client";

import { ListarAtestado } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarAtestadoRepsository implements ListarAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ id: number }[]> {
    return await this.prisma.atestado_funcionario.findMany({
      where: {
        tipo_status: {
          id: 1, // Assumindo que 'tipo_status' é uma relação e você quer filtrar pelo campo 'id' dentro dela
        },
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
      },
    });
  }
}
