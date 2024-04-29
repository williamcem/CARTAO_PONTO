import { Router } from "express";
import multer from "multer";
import { processarArquivo } from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/upload", upload.single("arquivo"), (req, res) => processarArquivo(req, res));
};

export default route;
