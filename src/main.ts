import "dotenv/config";
import app from "./main/config/app";

app.listen(3000, () => console.log("Server rodando em http://localhost:3000"));
