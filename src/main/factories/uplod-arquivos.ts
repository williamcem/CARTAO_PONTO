import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { DbAddUpload } from "../../data/usecase/upload-protheus/db-add-upload-prothues";
import { UploadPostgresRepository } from "../../infra/db/postgresdb/uplod-repository/upload-protheus";
import { UploadController } from "../../presentation/controllers/upload-protheus/upload-prothues";
import { processarArquivo } from "../adapters/protheus-route-adapter";

export const makeUploadController = (): Controller => {
  const uploadPostgresRepository = new UploadPostgresRepository();
  const uploadController = new UploadController(uploadPostgresRepository);
  return new LogControllerDecorator(uploadController);
};
