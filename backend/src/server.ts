import "dotenv/config";
import { createApp } from "./presentation/app";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`🚀 DocPrático BFF running at http://${HOST}:${PORT}`);
  console.log(`📚 Swagger docs available at http://${HOST}:${PORT}/api-docs`);
  console.log(`💚 Health check at http://${HOST}:${PORT}/health`);
});