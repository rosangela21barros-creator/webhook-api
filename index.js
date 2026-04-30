import express from "express";

const app = express();
app.use(express.json());

// ROTA PRINCIPAL WEBHOOK CAKTO
app.post("/webhook/cakto", (req, res) => {
  console.log("🔥 Webhook recebido");

  // responde imediatamente (evita erro 500 na Cakto)
  res.status(200).json({ success: true });

  // processa depois (não quebra resposta)
  setTimeout(async () => {
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
        console.log("❌ Email não encontrado");
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trial_expired: false,
            subscription_active: true,
          }),
        });

        console.log("🚀 Acesso liberado!");
      } catch (err) {
        console.log("⚠️ Erro no PocketBase:", err.message);
      }
    } catch (err) {
      console.log("❌ Erro geral:", err.message);
    }
  }, 0);
});

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("Webhook rodando 🚀");
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
