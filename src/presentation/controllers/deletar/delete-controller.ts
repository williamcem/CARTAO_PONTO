import { HttpRequest, HttpResponse, Controller } from "../deletar/delete-protocols";
import { DbAddDelete } from "../../../data/usecase/delete/db-add-delete";
import { serverError, ok, badRequest } from "../../../presentation/helpers/http-helpers";
import { DeleteParamError } from "../../errors/delet-param-error"

export class DeleteController implements Controller {
  private readonly dbAddDelete: DbAddDelete;

  constructor(dbAddDelete: DbAddDelete) {
    this.dbAddDelete = dbAddDelete;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.body; // Extrair o ID da requisição HTTP

      if (!id) {
        return badRequest(new DeleteParamError("ID do apontamento não fornecido"));
      }

      await this.dbAddDelete.deleteById({ id }); // Passar o ID extraído para deletar

      return ok({ message: "Registro deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
}
