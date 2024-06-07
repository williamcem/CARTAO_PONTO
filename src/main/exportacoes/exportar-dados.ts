import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const exportarDadosParaArquivo = async (callback: (err: Error | null, filename?: string) => void) => {
  try {
    // Conectar ao banco de dados e buscar os dados
    const dados = await prisma.funcionarios_afastados_status.findMany();

    // Escrever os dados em um arquivo de texto
    const filename = "dados_da_tabela.txt";
    const data = dados.map((row) => `${row.id}\t${row.nome}`).join("\n");

    fs.writeFile(filename, data, "utf8", (err) => {
      if (err) {
        console.error("Erro ao escrever arquivo:", err);
        return callback(err);
      }
      console.log(`Os dados foram exportados para ${filename}.`);
      return callback(null, filename);
    });
  } catch (err) {
    console.error("Erro ao exportar dados:", err);
    const error = err instanceof Error ? err : new Error("Erro desconhecido");
    return callback(error);
  } finally {
    await prisma.$disconnect();
  }
};
