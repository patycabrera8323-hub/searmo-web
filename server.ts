import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to handle contact form
  app.post("/api/contact", async (req, res) => {
    const { nombre, telefono, correo, direccion, empresa, idea } = req.body;
    console.log("Nuevo mensaje recibido:", { nombre, telefono, correo, direccion, empresa, idea });

    // URL leída de forma segura desde las variables de entorno (.env)
    const scriptUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!scriptUrl) {
      console.warn("⚠️  Falta GOOGLE_SHEETS_WEBHOOK_URL en el archivo .env. Solo se imprimió en consola.");
      return res.json({ status: "success", message: "Mensaje recibido (modo local sin Sheets)" });
    }

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, telefono, correo, direccion, empresa, idea })
      });

      if (response.ok) {
        res.json({ status: "success", message: "Mensaje guardado en Google Sheets" });
      } else {
        res.status(500).json({ status: "error", message: "Error al guardar en Sheets" });
      }
    } catch (error) {
      console.error("Error enviando a Google Sheets:", error);
      res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
