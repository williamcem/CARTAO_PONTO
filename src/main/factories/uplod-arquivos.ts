import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { UploadPostgresRepository } from "../../infra/db/postgresdb/uplod-repository/upload-protheus";
import { UploadController } from "../../presentation/controllers/upload-protheus/upload-prothues";

export const makeUploadController = (): Controller => {
  const uploadPostgresRepository = new UploadPostgresRepository();
  const uploadController = new UploadController(uploadPostgresRepository);
  return new LogControllerDecorator(uploadController);
};
