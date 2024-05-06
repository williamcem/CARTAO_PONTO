import { HttpResponse, Controller } from "./dif-min-protocols";
import { DifMinPostgresRepository } from "@infra/db/postgresdb/dif-min-repository/dif-min-repository";
import { serverError, ok } from "../../../presentation/helpers/http-helpers";
import { prisma } from "../../../infra/database/Prisma"

export class DifMinController implements Controller {
  constructor(private readonly difMinPostgresRepository: DifMinPostgresRepository) {}
  async handle(): Promise<HttpResponse> {
    try {
      // Recebe os dias anteriores do repositório
      const diasAnteriores = await this.difMinPostgresRepository.listarDiasAnteriores({
        dif_min: 0,
      });
      console.log("Dias anteriores recebidos do repositório:", diasAnteriores);

      // Verifica se diasAnteriores é um array e se não está vazio
      if (Array.isArray(diasAnteriores) && diasAnteriores.length > 0) {
        // Calcula a diferença de minutos negativos para cada dia anterior
        for (const dia of diasAnteriores) {
          let dif_min = 0;
          if (!dia.entradaManha) {
            // Se não houve entrada pela manhã, consideramos como ausência no turno
            // e calculamos os minutos negativos correspondentes à jornada completa
            dif_min -= calcularMinutosTrabalho("07:12", "17:00");
            dif_min = dif_min + 60;
          }

          const prismaClient = prisma;
          await prismaClient.dia.update({
            where: { id: dia.id },
            data: { dif_min: dif_min }, // Atualiza o dif_min (negativando o dia em minutos de carga horaria)
          });
        }
      } else {
        // Caso não haja dias anteriores, retorna uma resposta OK com uma mensagem
        return ok({ message: "Não há dias anteriores para processar" });
      }

      return ok({ message: "Diferenças de minutos negativos calculadas e salvas com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}

// função para calcular e negativar o dia não trabalhado
function calcularMinutosTrabalho(inicio: string, fim: string): number {
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);

  const minutosInicio = horaInicio * 60 + minutoInicio;
  const minutosFim = horaFim * 60 + minutoFim;

  return minutosFim - minutosInicio;
}
