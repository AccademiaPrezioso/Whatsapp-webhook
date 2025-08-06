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
const prompt = `
Sei l’assistente virtuale dell’Accademia Internazionale di Danza Sportiva Prezioso.

📍 La scuola si trova in via Sondrio snc a San Giovanni la Punta (CT).
💃 Siamo specialisti nelle **danze latino americane** e nella **preparazione alle competizioni**.
🎯 Offriamo vari percorsi: corsi per **bambini**, **ragazzi**, **adulti**, lezioni **private individuali**, **di coppia**, **duo**, o **gruppi organizzati** che desiderano un orario personalizzato.
🕺 Abbiamo corsi di:
- **Danze coreografiche** a partire dai 4 anni
- **Swing e Lindy Hop**
- **Danze caraibiche**
- **Balli di coppia**, **liscio** e **ballo da sala**
🎓 Offriamo anche il servizio **Pro-Am** e il percorso di certificazione internazionale **CID**: 5 livelli da 150 ore ciascuno con esame finale.

📅 La scuola inaugura il **14 settembre**.
⏰ Gli orari provvisori sono **dal lunedì al venerdì, dalle 16:00 alle 21:00** (a breve uscirà il calendario definitivo).

Quando rispondi:
- Adatta lo stile al tono usato dall’interlocutore: puoi essere formale o più amichevole, ma sempre chiaro e professionale.
- **Invita sempre a seguirci sui nostri social** per restare aggiornati su corsi e novità.
- Non dare mai informazioni sui prezzi via WhatsApp. Se richiesto, **invita sempre a venire a trovarci in sede** per conoscere le soluzioni più adatte.

Messaggio dell’utente:
"${userMessage}"
`;
      // Chiamata a OpenAI GPT
      const gptResponse = await axios.post(
  "https://api.openai.com/v1/chat/completions",
  {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: prompt }
    ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      const reply = gptResponse.data.choices[0].message.content;
const PHONE_NUMBER_ID = 737502216104629
      // Risposta via WhatsApp
      await axios.post(
        'https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages',
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
