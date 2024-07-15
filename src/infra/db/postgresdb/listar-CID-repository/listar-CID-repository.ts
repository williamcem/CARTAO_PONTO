import { PrismaClient } from "@prisma/client";

import { ListarCID } from "../../../../data/usecase/add-listar-CID/add-listar-CID";
import { prisma } from "../../../database/Prisma";

export class ListarCidRepsository implements ListarCID {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ grupo_cid: string }[]> {
    return await this.prisma.descricaco_cid.findMany();
  }
}
