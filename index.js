const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Configura il tuo token e ID
const VERIFY_TOKEN = "mioTokenSegreto"; // deve essere identico a quello inserito su Meta
const ACCESS_TOKEN = "EAAToMmfuQIYBPOrEY8TkvFNZAHwLxmFpiigMohbQcyyA9gDF5hAwxJr6vLOwZBXKGp4SsXTN4GnOydUdZCbReZB9eZCs1DiBofOmmFkDKdrIgZCsB4E30yxQxLxwlees368zICIvxuUuUKFaH2teUBdhZCmZCRjnVSyNOuDlt6CduZBO7zwwzWX54kKsKBHDERJvDuTfouqR4O7hoMjlBvgHX1enkAmS0VXvtitXlk0ZAzgb7xPBskIrzPaLwU4xrc";
const PHONE_NUMBER_ID = "737502216104629";

app.use(bodyParser.json());

// Verifica iniziale webhook con Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verificato!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Gestione ricezione messaggi
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Messaggio ricevuto:", JSON.stringify(body, null, 2));

  if (
    body.object &&
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from; // Numero del mittente
    const text = message.text.body; // Testo del messaggio ricevuto

    console.log(`✉️ Da: ${from} - Testo: ${text}`);

    // Invia una risposta automatica
    try {
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Grazie per il tuo messaggio! Ti risponderemo il prima possibile.",
          },
        },
      });

      console.log("✅ Risposta inviata");
    } catch (error) {
      console.error("❌ Errore nell'invio della risposta:", error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su porta ${PORT}`);
});
