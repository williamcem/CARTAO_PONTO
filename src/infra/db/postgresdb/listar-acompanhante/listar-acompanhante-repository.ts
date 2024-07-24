import { PrismaClient } from "@prisma/client";

import { ListarAcompanhante } from "../../../../data/usecase/add-listar-todos-tipos-atestado/add-listar-tipos-acompanhante";
import { prisma } from "../../../database/Prisma";

export class ListarAcompanahanteRepsository implements ListarAcompanhante {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipo_acompanhante.findMany();
  }
}
