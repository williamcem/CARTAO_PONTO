import "dotenv/config";
import app from "./main/config/app";

app.listen(process.env.PORT, () => console.log(`Server rodando em http://localhost:${process.env.PORT}`));
