import { Router } from "express";
import multer from "multer";

import {
  importarArquivoCartao,
  importarArquivoFuncionario,
  importarArquivosAfastamento,
  processarArquivo,
} from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/upload", upload.single("arquivo"), (req, res) => processarArquivo(req, res));
  router.post("/uploadfuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
  router.post("/uploadcartao", upload.single("arquivo"), (req, res) => importarArquivoCartao(req, res));

  router.post("/uploadafastamento", upload.single("arquivo"), (req, res) => importarArquivosAfastamento(req, res));
};

export default route;
