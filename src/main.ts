import "dotenv/config";
import app from "./main/config/app";

app.listen(64000, () => console.log("Server rodando em http://localhost:64000"));
