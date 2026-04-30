import express from "express";

const app = express();
app.use(express.json());

const PB_URL = "https://salaofacilnet.com.br";

app.post("/webhook/cakto", async (req, res) => {
  console.log("🔥 Webhook recebido");

  // ⚠️ responde imediatamente (evita timeout/500 na Cakto)
  res.status(200).json({ success: true });

  // 🔄 processa em background (qualquer erro não afeta resposta)
  setImmediate(async () => {
    try {
      const payload = req.body || {};
      const data = payload.data || {};
      const status = data.status;

      if (status !== "paid") {
        console.log("ℹ️ Evento ignorado:", status);
        return;
      }

      const email = data.customer?.email;
      console.log("💰 Pagamento aprovado:", email);

      if (!email) {
        console.log("❌ Email não encontrado no payload");
        return;
      }

      const PB_URL = "https://salaofacilnet.com.br";

      try {
        const resp = await fetch(
          `${PB_URL}/api/collections/users/records?filter=email="${email}"`
        );
        const json = await resp.json();

        if (!json.items || json.items.length === 0) {
          console.log("❌ Usuário não encontrado");
          return;
        }

        const user = json.items[0];

        await fetch(`${PB_URL}/api/collections/users/records/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trial_expired: false,
            subscription_active: true,
          }),
        });

        console.log("🚀 Acesso liberado com sucesso!");
      } catch (pbErr) {
        console.error("⚠️ Erro ao acessar PocketBase:", pbErr.message);
      }
    } catch (err) {
      console.error("❌ Erro geral no webhook:", err.message);
    }
  });
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
