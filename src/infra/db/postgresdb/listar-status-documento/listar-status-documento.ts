import { PrismaClient } from "@prisma/client";

import { ListarTiposDocumentos } from "../../../../data/usecase/add-listar-todos-tipos-atestado/add-listar-tipos-status-documento";
import { prisma } from "../../../database/Prisma";

export class ListarStatusDocumentoRepsository implements ListarTiposDocumentos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipo_status.findMany({
      where: {
        id: {
          in: [2, 3],
        },
      },
    });
  }
}
