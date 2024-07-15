import { PrismaClient } from "@prisma/client";

import { ListarDescricaco } from "../../../../data/usecase/add-listar-descricaco/add-listar-CID";
import { prisma } from "../../../database/Prisma";

export class ListarDescricacoRepsository implements ListarDescricaco {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ descricaco: string }[]> {
    return await this.prisma.descricaco_cid.findMany();
  }
}
