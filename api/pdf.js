
const PDF_FILES = {
  hemato: "ImunoHemato.pdf",
  p1: "Imunologia P1.pdf",
  p2: "Imunologia P2.pdf",
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const id = req.query?.id;
  const fileName = PDF_FILES[id];

  if (!fileName) {
    return res.status(400).json({ error: "PDF inválido." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Configuração do servidor incompleta.",
    });
  }

  try {
    const encodedFileName = fileName
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/imunolab-pdfs/${encodedFileName}`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 60 }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.signedURL) {
      console.error("Erro ao gerar link temporário:", data);
      return res.status(502).json({
        error: "Não foi possível gerar o link do PDF.",
      });
    }

    let signedUrl = data.signedURL;

    if (signedUrl.startsWith("/storage/v1/")) {
      signedUrl = `${supabaseUrl}${signedUrl}`;
    } else if (signedUrl.startsWith("/")) {
      signedUrl = `${supabaseUrl}/storage/v1${signedUrl}`;
    }

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error("Erro ao acessar o Supabase:", error);
    return res.status(500).json({
      error: "Erro interno ao acessar o PDF.",
    });
  }
}

