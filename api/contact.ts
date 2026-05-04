import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, telefono, correo, direccion, empresa, idea } = req.body;

  const scriptUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!scriptUrl) {
    console.warn("⚠️  Falta GOOGLE_SHEETS_WEBHOOK_URL en las variables de entorno de Vercel.");
    return res.status(200).json({ status: "success", message: "Mensaje recibido (sin Sheets configurado)" });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, correo, direccion, empresa, idea }),
    });

    if (response.ok) {
      return res.status(200).json({ status: "success", message: "Mensaje guardado en Google Sheets" });
    } else {
      return res.status(500).json({ status: "error", message: "Error al guardar en Sheets" });
    }
  } catch (error) {
    console.error("Error enviando a Google Sheets:", error);
    return res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
}
