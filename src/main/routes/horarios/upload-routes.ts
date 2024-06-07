import { Router } from "express";
import multer from "multer";

import {
  importarArquivoCartao,
  importarArquivoFuncionario,
  importarArquivosAfastamento,
} from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/uploadfuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
  router.post("/uploadcartao", upload.single("arquivo"), (req, res) => importarArquivoCartao(req, res));
  router.post("/uploadafastamento", upload.single("arquivo"), (req, res) => importarArquivosAfastamento(req, res));
};

export default route;
