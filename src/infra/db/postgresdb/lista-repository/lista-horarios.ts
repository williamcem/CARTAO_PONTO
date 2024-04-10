// list-horarios.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listHorarios() {
  try {
    const horarios = await prisma.dia.findMany({ orderBy: { data: "asc" } }); // Consulta todos os horários no banco de dados usando o Prisma

    return horarios; // Retorna os horários recuperados do banco de dados
  } catch (error) {
    throw new Error("Erro ao listar os horários"); // Lança um erro se ocorrer um problema ao acessar o banco de dados
  }
}
