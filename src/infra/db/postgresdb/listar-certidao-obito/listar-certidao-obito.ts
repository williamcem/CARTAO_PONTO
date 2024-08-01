import { PrismaClient } from "@prisma/client";

import { ListarTiposCertidaoObito } from "../../../../data/usecase/add-listar-todos-tipos-atestado/add-listar-tipos-certidao-obito";
import { prisma } from "../../../database/Prisma";

export class ListarCertidaoObitoPostgresRepository implements ListarTiposCertidaoObito {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ id: number; nome: string }[]> {
    return await this.prisma.tipo_certidao_obito.findMany();
  }
}
