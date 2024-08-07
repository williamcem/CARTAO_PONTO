import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class ListarUsuarioPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(input: { localidadeCodigo?: string }): Promise<
    {
      localidade: {
        codigo: string;
        nome: string;
      };
      usuarioPerfil: {
        id: number;
        nome: string;
        acesso: number;
      };
      id: number;
      localidadeCodigo: string;
      usuarioPerfilId: number;
      senha: string;
      userName: string;
      createAt: Date;
      updateAt: Date;
    }[]
  > {
    const usuarios = await this.prisma.usuario.findMany({
      where: { localidadeCodigo: input.localidadeCodigo },
      include: {
        localidade: true,
        usuarioPerfil: true,
      },
    });

    const output: {
      localidade: {
        codigo: string;
        nome: string;
      };
      usuarioPerfil: {
        id: number;
        nome: string;
        acesso: number;
      };
      id: number;
      localidadeCodigo: string;
      usuarioPerfilId: number;
      senha: string;
      userName: string;
      createAt: Date;
      updateAt: Date;
    }[] = [];

    usuarios.map((usuario) => output.push(usuario));

    return output;
  }
}
