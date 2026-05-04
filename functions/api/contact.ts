export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { nombre, telefono, correo, direccion, empresa, idea } = data;

    // En Cloudflare, las variables de entorno se obtienen de context.env
    const scriptUrl = context.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!scriptUrl) {
      console.warn("⚠️  Falta GOOGLE_SHEETS_WEBHOOK_URL en las variables de entorno de Cloudflare.");
      return new Response(JSON.stringify({ status: "success", message: "Mensaje recibido (sin Sheets configurado)" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, correo, direccion, empresa, idea }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ status: "success", message: "Mensaje guardado en Google Sheets" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ status: "error", message: "Error al guardar en Sheets" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error enviando a Google Sheets:", error);
    return new Response(JSON.stringify({ status: "error", message: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
