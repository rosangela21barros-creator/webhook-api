import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/cakto", async (req, res) => {
  console.log("🔥 Webhook recebido:", req.body);

  try {
    const data = req.body?.data;

    if (!data || data.status !== "paid") {
      return res.json({ success: true });
    }

    const email = data.customer?.email;

    console.log("💰 Pagamento aprovado para:", email);

    res.json({ success: true });

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});