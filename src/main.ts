import "dotenv/config";
import app from "./main/config/app";

app.listen(Number(process.env.PORT), "0.0.0.0", () => console.log(`Server rodando em http://localhost:${process.env.PORT}`));
