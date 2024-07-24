import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class LogarPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtUsuario(input: {
    usuarioPerfilId: number;
    localidadeCodigo: string;
  }): Promise<{ id: number; senha: string } | undefined> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { usuarioPerfilId: input.usuarioPerfilId, localidadeCodigo: input.localidadeCodigo },
    });

    if (!usuario) return undefined;

    return {
      id: usuario.id,
      senha: usuario.senha,
    };
  }

  public async findFisrtPerfil(input: { id: number }): Promise<{ id: number; nome: string; acesso: number } | undefined> {
    const perfil = await this.prisma.usuario_perfil.findFirst({
      where: { id: input.id },
    });

    if (!perfil) return undefined;

    return {
      id: perfil.id,
      acesso: perfil.acesso,
      nome: perfil.nome,
    };
  }
}
