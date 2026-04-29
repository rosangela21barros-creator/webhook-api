import express from "express";

const app = express();
app.use(express.json());

const PB_URL = "https://salaofacilnet.com.br";

app.post("/webhook/cakto", async (req, res) => {
  console.log("🔥 Webhook recebido:", req.body);

  try {
    const data = req.body?.data;

    if (!data || data.status !== "paid") {
      return res.json({ success: true });
    }

    const email = data.customer?.email;

    console.log("💰 Pagamento aprovado para:", email);

    // 🔍 buscar usuário no PocketBase
    const response = await fetch(
      `${PB_URL}/api/collections/users/records?filter=email="${email}"`
    );

    const result = await response.json();

    if (!result.items || result.items.length === 0) {
      console.log("❌ Usuário não encontrado");
      return res.json({ success: true });
    }

    const user = result.items[0];

    console.log("✅ Usuário encontrado:", user.id);

    // 🔓 liberar acesso (exemplo: remover bloqueio)
    await fetch(`${PB_URL}/api/collections/users/records/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trial_expired: false,
        subscription_active: true,
      }),
    });

    console.log("🚀 Acesso liberado com sucesso!");

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
