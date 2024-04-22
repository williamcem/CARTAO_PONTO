import { PrismaClient } from "@prisma/client";
import { ListarListaRepository } from "../../../../data/usecase/find-listar/find-listarhorarios-repository";
import { ListarListaModel } from "../../../../domain/usecases/lista-horarios";
import { ListaModel } from "../../../../domain/models/lista";

export class ListaPostgresRepository implements ListarListaRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async list(horariosData: ListarListaModel): Promise<ListaModel[]> {
    try {
      // Consulta todos os horários no banco de dados usando o Prisma e inclui os dados relacionados da tabela receberdados
      const horarios = await this.prisma.dia.findMany({
        orderBy: {
          receberdados: { data: "asc" },
        },
        include: {
          receberdados: true,
        },
      });

      // Mapeia os horários recuperados do banco de dados para o formato desejado
      const listaHorarios: ListaModel[] = horarios.map((horario) => ({
        id: horario.id,
        entradaManha: horario.entradaManha,
        saidaManha: horario.saidaManha,
        entradaTarde: horario.entradaTarde,
        saidaTarde: horario.saidaTarde,
        entradaExtra: horario.entradaExtra || undefined,
        saidaExtra: horario.saidaExtra || undefined,
        dif_min: horario.dif_min,
        saldoAnt: horario.saldoAnt,
        // Adiciona os dados relacionados da tabela receberdados
        mes: horario.receberdados?.mes || "",
        data: horario.receberdados?.data || "",
        diaSemana: horario.receberdados?.diaSemana || "",
        status: horario.receberdados?.status || "",
        nome: horario.receberdados?.nome || "",
        matricula: horario.receberdados?.matricula || "",
        setor: horario.receberdados?.setor || "",
        expediente: horario.receberdados?.expediente || "",
        saldoanterior: horario.receberdados?.saldoanterior || 0,
      }));

      return listaHorarios; // Retorna os horários recuperados e mapeados do banco de dados
    } catch (error) {
      throw new Error("Erro ao listar os horários"); // Lança um erro se ocorrer um problema ao acessar o banco de dados
    }
  }
}
