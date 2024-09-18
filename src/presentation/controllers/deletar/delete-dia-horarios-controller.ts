import { DelDeleteRepository } from "../../../data/usecase/delete-dia-horarios/add-delete-repository";
import { badRequestNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./delete-protocols";

export class DeleteController implements Controller {
  private readonly deleteRepository: DelDeleteRepository;

  constructor(deleteRepository: DelDeleteRepository) {
    this.deleteRepository = deleteRepository;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartao_dia_id } = httpRequest.body; // Extrair o ID da requisição HTTP

      if (!cartao_dia_id) {
        return badRequestNovo({ message: "ID do dia não fornecido" });
      }

      // Buscar o cartao_dia para verificar o status do cartão
      const cartaoDiaExists = await this.deleteRepository.findCartaoDiaById({ cartao_dia_id });

      if (!cartaoDiaExists) {
        return badRequestNovo({ message: "Cartão do dia não encontrado" });
      }

      // Deletar os lançamentos e eventos relacionados ao cartao_dia_id
      const deletionResult = await this.deleteRepository.deleteById({ cartao_dia_id });

      if (!deletionResult) {
        return badRequestNovo({ message: "Impossível deletar registros de um cartão finalizado" });
      }

      return ok({ message: "Registros associados ao dia do cartão deletados com sucesso" });
    } catch (error) {
      console.error("Erro no controller ao tentar deletar registros:", error);
      return serverError();
    }
  }
}
