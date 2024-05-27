import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { ProcurarLocalidadeIdent } from "../../../../data/usecase/procurar-funcionario/procurar-localidades";

export class LocalidadePostgresRepository implements ProcurarLocalidadeIdent {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(): Promise<{ codigo: string; nome: string }[]> {
    return await this.prisma.localidade.findMany();
  }
}
