import { PrismaClient } from "@prisma/client";

import { ListarAtestado } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarAtestadoRepsository implements ListarAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ id: number }[]> {
    return await this.prisma.atestado_funcionario.findMany();
  }
}
