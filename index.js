require("dotenv").config();

console.log(
  "STRIPE_SECRET_KEY:",
  process.env.STRIPE_SECRET_KEY
    ? "OK"
    : "UNDEFINED"
);

console.log(
  "STRIPE_WEBHOOK_SECRET:",
  process.env.STRIPE_WEBHOOK_SECRET
    ? "OK"
    : "UNDEFINED"
);

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const { db } = require("./firebaseAdmin");

const app = express();

const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY
);

/*
=================================
WEBHOOK STRIPE
TEM QUE VIR ANTES DO express.json()
=================================
*/
app.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {

    const signature =
      req.headers["stripe-signature"];

    let event;

    try {

      console.log("===== WEBHOOK =====");

      console.log("SIGNATURE:");
      console.log(signature);

      console.log("BODY TYPE:");
      console.log(typeof req.body);

      console.log("BODY:");
      console.log(req.body);

      console.log(
        "WEBHOOK SECRET:"
      );
      console.log(
        process.env.STRIPE_WEBHOOK_SECRET
      );

      event =
        stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env
            .STRIPE_WEBHOOK_SECRET
        );

      console.log(
        "EVENTO RECEBIDO:"
      );
      console.log(
        event.type
      );

    } catch (err) {

      console.log(
        "ERRO WEBHOOK:"
      );

      console.log(
        err.message
      );

      return res
        .status(400)
        .send(
          `Webhook Error: ${err.message}`
        );
    }

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      try {

        const session =
          event.data.object;

        const uid =
          session.metadata?.uid;

        console.log(
          "================================"
        );

        console.log(
          "PAGAMENTO APROVADO"
        );

        console.log(
          "UID:",
          uid
        );

        console.log(
          "================================"
        );

        if (uid) {

          await db
            .collection("users")
            .doc(uid)
            .update({
              plano: "pro",
            });

          console.log(
            "USUARIO ATUALIZADO PARA PRO"
          );

        } else {

          console.log(
            "UID NÃO ENCONTRADO NO METADATA"
          );

        }

      } catch (err) {

        console.log(
          "ERRO FIRESTORE:"
        );

        console.log(
          err
        );

      }
    }

    res.json({
      received: true,
    });
  }
);

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send(
    "Backend Stripe Online 🚀"
  );
});

app.post(
  "/create-checkout-session",
  async (req, res) => {
    try {

      const {
        uid,
        email,
      } = req.body;

      console.log(
        "================================"
      );

      console.log(
        "CRIANDO CHECKOUT"
      );

      console.log(
        "UID:",
        uid
      );

      console.log(
        "EMAIL:",
        email
      );

      console.log(
        "================================"
      );

      const session =
        await stripe.checkout.sessions.create({
          mode:
            "subscription",

          customer_email:
            email,

          metadata: {
            uid:
              uid || "",
          },

          line_items: [
            {
              price:
                "price_1TibL29WTqacWr6iR6uVBdL9",
              quantity: 1,
            },
          ],

          success_url:
            "http://localhost:5173?success=true",

          cancel_url:
            "http://localhost:5173?cancel=true",
        });

      console.log(
        "CHECKOUT:"
      );

      console.log(
        session.url
      );

      return res.json({
        url:
          session.url,
      });

    } catch (err) {

      console.log(
        "================================"
      );

      console.log(
        "ERRO STRIPE"
      );

      console.log(
        err
      );

      console.log(
        "================================"
      );

      return res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  }
);

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `🚀 Stripe rodando na porta ${PORT}`
  );
});