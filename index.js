const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

const VERIFY_TOKEN = "mioTokenSegreto"; // Sostituisci con il tuo token di verifica
const WHATSAPP_TOKEN = "EAAToMmfuQIYBPOrEY8TkvFNZAHwLxmFpiigMohbQcyyA9gDF5hAwxJr6vLOwZBXKGp4SsXTN4GnOydUdZCbReZB9eZCs1DiBofOmmFkDKdrIgZCsB4E30yxQxLxwlees368zICIvxuUuUKFaH2teUBdhZCmZCRjnVSyNOuDlt6CduZBO7zwwzWX54kKsKBHDERJvDuTfouqR4O7hoMjlBvgHX1enkAmS0VXvtitXlk0ZAzgb7xPBskIrzPaLwU4xrc"; // Inserisci qui il tuo token WhatsApp
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Inserisci qui la tua API key di OpenAI

// ✅ Verifica Webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("🔐 Webhook verificato!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Ricezione messaggi (POST)
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const userMessage = message.text?.body;

      console.log("💬 Messaggio ricevuto:", userMessage);

      // Chiamata a OpenAI GPT
      const gptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Sei una segreteria virtuale professionale di un'accademia di danza sportiva." },
            { role: "user", content: userMessage }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      const reply = gptResponse.data.choices[0].message.content;

      // Risposta via WhatsApp
      await axios.post(
        "https://graph.facebook.com/v18.0/737502216104629/messages",
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: WHATSAPP_TOKEN
          }
        }
      );

      console.log("✅ Risposta inviata:", reply);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Errore durante la gestione del messaggio:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// ✅ Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su porta ${PORT}`);
});
