import { Router } from "express";
import multer from "multer";
import { processarArquivo, importarArquivoFuncionario, importarArquivoCartao } from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/upload", upload.single("arquivo"), (req, res) => processarArquivo(req, res));
  router.post("/uploadfuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
  router.post("/uploadcartao", upload.single("arquivo"), (req, res) => importarArquivoCartao(req, res));
};

export default route;
