import { Response, Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeUploadController } from "../../factories/uplod-arquivos";
import multer from "multer";
import { processarArquivo } from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.patch("/upload", upload.single("arquivo"), (req, res) => processarArquivo(req, res));
};

export default route;
