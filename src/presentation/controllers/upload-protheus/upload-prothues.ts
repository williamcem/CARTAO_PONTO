import { HttpResponse, Controller } from "./upload-protocols";
import { serverError, ok } from "../../helpers/http-helpers";
import { UploadPostgresRepository } from "@infra/db/postgresdb/uplod-repository/upload-protheus";

export class UploadController implements Controller {
  constructor(private readonly uploadPostgresRepository: UploadPostgresRepository) {}
  async handle(): Promise<HttpResponse> {
    try {
      const protheus = await this.uploadPostgresRepository.add({
        id: "",
        dado1: "",
        dado2: "",
        dado3: "",
        dado4: "",
        dado5: "",
        dado6: "",
      });

      return ok(protheus);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
