import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
