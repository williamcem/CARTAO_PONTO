import { Router } from "express";
import multer from "multer";

import {
  importarArquivoCartao,
  importarArquivoFuncionario,
  importarArquivoGrupoTrabalho,
  importarArquivosAfastamento,
} from "../../adapters/protheus-route-adapter";

const upload = multer();

// Rota para fazer uplod de arquivos
const route = (router: Router): void => {
  router.post("/uploadfuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
  router.post("/uploadcartao", upload.single("arquivo"), (req, res) => importarArquivoCartao(req, res));
  router.post("/uploadafastamento", upload.single("arquivo"), (req, res) => importarArquivosAfastamento(req, res));
  router.post("/uploadagrupotrabalho", upload.single("arquivo"), (req, res) => importarArquivoGrupoTrabalho(req, res));
};

export default route;
