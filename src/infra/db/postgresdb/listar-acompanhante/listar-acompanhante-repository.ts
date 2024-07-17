import { PrismaClient } from "@prisma/client";

import {  } from "../../../../data/usecase/add-listar-tipos-acompanhante/add-listar-tipos-acompanhante";
import { prisma } from "../../../database/Prisma";

export class ListarAcompanahanteRepsository implements ListarLacamentos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipo_acompanhante.findMany();
  }
}

