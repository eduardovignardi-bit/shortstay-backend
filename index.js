require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Stripe Online 🚀");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { uid, email } = req.body;

    console.log("================================");
    console.log("CRIANDO CHECKOUT");
    console.log("UID:", uid);
    console.log("EMAIL:", email);
    console.log("================================");

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        customer_email: email,

        metadata: {
          uid: uid || "",
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

    console.log("CHECKOUT:");
    console.log(session.url);

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.log("================================");
    console.log("ERRO STRIPE");
    console.log(err);
    console.log("================================");

    res.status(500).json({
      error: err.message,
    });
  }
});

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `🚀 Stripe rodando na porta ${PORT}`
  );
});