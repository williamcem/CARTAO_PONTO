import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class CriarUsuarioPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtLocalidade(input: { codigo: string }): Promise<{ id: string; nome: string } | undefined> {
    const localidade = await this.prisma.localidade.findFirst({ where: { codigo: input.codigo } });

    if (!localidade) return undefined;

    return {
      id: localidade.codigo,
      nome: localidade.nome,
    };
  }

  public async findFisrtPerfil(input: { id: number }): Promise<{ id: number; nome: string } | undefined> {
    const perfil = await this.prisma.usuario_perfil.findFirst({ where: { id: input.id } });

    if (!perfil) return undefined;

    return {
      id: perfil.id,
      nome: perfil.nome,
    };
  }

  public async findFisrtUsuario(input: { localidadeCodigo: string; perfilId: number }): Promise<{ id: number } | undefined> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { localidadeCodigo: input.localidadeCodigo, usuarioPerfilId: input.perfilId },
    });

    if (!usuario) return undefined;

    return {
      id: usuario.id,
    };
  }

  public async create(input: {
    perfilId: number;
    senha: string;
    localidadeCodigo: string;
    userName: string;
  }): Promise<{ id: number; createAt: Date } | undefined> {
    const usuario = await this.prisma.usuario.create({
      data: {
        usuarioPerfilId: input.perfilId,
        senha: input.senha,
        userName: input.userName,
        localidadeCodigo: input.localidadeCodigo,
      },
    });

    if (!usuario) return undefined;

    return {
      id: usuario.id,
      createAt: usuario.createAt,
    };
  }
}
