import moment from "moment";
import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./desligar-funcionario-protocols";
import { DesligarFuncionarioPostgresRepository } from "@infra/db/postgresdb/desligar-funcionario/desligar-funcionario";

export class DesligarFuncionarioController implements Controller {
  constructor(private readonly desligarFuncionarioPostgresRepository: DesligarFuncionarioPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, data }: { id: number; data: Date } = httpRequest.body;

      if (!id) return badRequestNovo({ message: "Falta sequência do funcionário!" });
      if (!data) return badRequestNovo({ message: "Falta data do desligamento!" });

      const dataFormatada = moment(data);

      if (!dataFormatada.isValid()) return badRequestNovo({ message: "Data inválida!" });

      const funcionario = await this.desligarFuncionarioPostgresRepository.findFisrtFuncionario({
        id: Number(id),
      });

      if (!funcionario) return notFoundNovo({ message: "Funcionário não localizado!" });

      if (funcionario.funcionario_desligado?.id) return badRequestNovo({ message: "Funcionário já foi desligado!" });

      const criado = await this.desligarFuncionarioPostgresRepository.create({
        funcionarioId: funcionario.id,
        data: dataFormatada.toDate(),
        cartoes: funcionario.cartao.map((cartao) => ({
          id: cartao.id,
          statusId: 3, //Desligado
        })),
      });

      if (!criado) return serverError();

      return ok({
        message: criado,
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
