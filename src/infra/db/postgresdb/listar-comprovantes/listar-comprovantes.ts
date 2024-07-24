import { PrismaClient } from "@prisma/client";

import { ListarTiposComprovantes } from "../../../../data/usecase/add-listar-todos-tipos-atestado/add-listar-tipos-comprovantes-ausencias";
import { prisma } from "../../../database/Prisma";

export class ListarComprovantesRepsository implements ListarTiposComprovantes {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipo_comprovante_ausencia.findMany();
  }
}
