import { Router } from "express";
import multer from "multer";
import { processarArquivo, importarArquivoFuncionario } from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/upload", upload.single("arquivo"), (req, res) => processarArquivo(req, res));
  router.post("/uploadFuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
};

export default route;
