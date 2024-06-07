import { DbAddDelete } from "../../../data/usecase/delete-dia-horarios/db-add-delete";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./delete-protocols";

export class DeleteController implements Controller {
  private readonly dbAddDelete: DbAddDelete;

  constructor(dbAddDelete: DbAddDelete) {
    this.dbAddDelete = dbAddDelete;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartao_dia_id } = httpRequest.body; // Extrair o ID da requisição HTTP

      if (!cartao_dia_id) {
        return badRequest(new FuncionarioParamError("ID do dia não fornecido"));
      }

      await this.dbAddDelete.deleteById({ cartao_dia_id }); // Passar o ID extraído para deletar

      return ok({ message: "Registro deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
}
