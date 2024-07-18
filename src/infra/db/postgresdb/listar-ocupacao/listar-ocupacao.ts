import { PrismaClient } from "@prisma/client";

import { ListarOcupacao } from "../../../../data/usecase/add-listar-tipos-ocupacao/add-listar-tipos-ocupacao";
import { prisma } from "../../../database/Prisma";

export class ListarOcupacaoRepsository implements ListarOcupacao {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipo_ocupacao.findMany();
  }
}
