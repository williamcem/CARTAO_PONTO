import { PrismaClient } from "@prisma/client";

import { ListarDocumento } from "../../../../data/usecase/add-listar-tipos-documento/add-listar-tipos-documento";
import { prisma } from "../../../database/Prisma";

export class ListarDocumentoRepsository implements ListarDocumento {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.tipos_documentos.findMany();
  }
}
