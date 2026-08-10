require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const axios = require("axios");


const app = express();

const PORT = process.env.PORT || 3000;


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


/* =========================
   STATIC WEBSITE
========================= */

app.use(express.static(
  path.join(__dirname)
));


/* =========================
   SIMPLE ORDER STORAGE
========================= */

const ordersFile =
  path.join(__dirname, "orders.json");


function readOrders() {

  if (!fs.existsSync(ordersFile)) {

    fs.writeFileSync(
      ordersFile,
      "[]",
      "utf8"
    );

  }

  return JSON.parse(
    fs.readFileSync(
      ordersFile,
      "utf8"
    )
  );

}


function saveOrders(orders) {

  fs.writeFileSync(
    ordersFile,
    JSON.stringify(
      orders,
      null,
      2
    ),
    "utf8"
  );

}


/* =========================
   HELPERS
========================= */

function normalizePhone(phone) {

  let value =
    String(phone)
      .replace(/\s+/g, "")
      .replace(/-/g, "");


  if (value.startsWith("+254")) {

    value = value.substring(1);

  }


  if (value.startsWith("07")) {

    value =
      "254" +
      value.substring(1);

  }


  if (value.startsWith("01")) {

    value =
      "254" +
      value.substring(1);

  }


  return value;

}


function createOrderId() {

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");


  const random =
    crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();


  return `EVA-${date}-${random}`;

}


/* =========================
   PAYHERO CONFIGURATION
========================= */

const PAYHERO_URL =
  "https://api.payhero.co.ke/api/v2/payments";


const BASIC_AUTH =
  process.env.PAYHERO_BASIC_AUTH;


const CHANNEL_ID =
  process.env.PAYHERO_CHANNEL_ID;


const CALLBACK_URL =
  process.env.CALLBACK_URL;


/* =========================
   START PAYMENT
========================= */

app.post("/api/pay", async (req, res) => {

  try {

    const {
      name,
      phone,
      location,
      address,
      amount,
      items
    } = req.body;


    /* Validate */

    if (
      !name ||
      !phone ||
      !location ||
      !amount ||
      !Array.isArray(items) ||
      !items.length
    ) {

      return res.status(400).json({

        message:
          "Missing required order information."

      });

    }


    const numericAmount =
      Number(amount);


    if (
      !Number.isInteger(numericAmount) ||
      numericAmount <= 0
    ) {

      return res.status(400).json({

        message:
          "Invalid payment amount."

      });

    }


    const mpesaPhone =
      normalizePhone(phone);


    if (
      !/^254\d{9}$/.test(mpesaPhone)
    ) {

      return res.status(400).json({

        message:
          "Please enter a valid Kenyan M-Pesa number."

      });

    }


    if (
      !BASIC_AUTH ||
      !CHANNEL_ID ||
      !CALLBACK_URL
    ) {

      console.error(
        "PayHero environment variables are missing."
      );


      return res.status(500).json({

        message:
          "Payment service is not configured."

      });

    }


    const orderId =
      createOrderId();


    /*
      Create local order BEFORE
      initiating payment.
    */

    const orders =
      readOrders();


    const order = {

      orderId,

      name,

      phone: mpesaPhone,

      location,

      address: address || "",

      amount: numericAmount,

      transportation: 0,

      items,

      status: "PENDING",

      paymentStatus: "PENDING",

      createdAt:
        new Date().toISOString()

    };


    orders.push(order);

    saveOrders(orders);


    /*
      PayHero STK PUSH
    */

    const payload = {

      amount: numericAmount,

      phone_number: mpesaPhone,

      channel_id: CHANNEL_ID,

      provider: "MPESA",

      external_reference: orderId,

      callback_url: CALLBACK_URL

    };


    console.log(
      "Starting STK Push:",
      orderId,
      mpesaPhone,
      numericAmount
    );


    const response =
      await axios.post(
        PAYHERO_URL,
        payload,
        {

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Basic ${BASIC_AUTH}`

          },

          timeout: 30000

        }
      );


    /*
      Save PayHero response for
      troubleshooting/reference.
    */

    const updatedOrders =
      readOrders();


    const currentOrder =
      updatedOrders.find(
        item =>
          item.orderId === orderId
      );


    if (currentOrder) {

      currentOrder.payheroResponse =
        response.data;

      currentOrder.stkInitiatedAt =
        new Date().toISOString();

      saveOrders(updatedOrders);

    }


    return res.status(200).json({

      success: true,

      orderId,

      message:
        "STK Push sent successfully."

    });


  } catch (error) {

    console.error(
      "PAYMENT ERROR:",
      error.response?.data ||
      error.message
    );


    return res.status(
      error.response?.status || 500
    ).json({

      message:
        error.response?.data?.message ||
        "Unable to initiate M-Pesa payment."

    });

  }

});


/* =========================
   PAYHERO CALLBACK
========================= */

app.post(
  "/api/payment/callback",
  async (req, res) => {

    try {

      console.log(
        "PAYHERO CALLBACK:",
        JSON.stringify(
          req.body,
          null,
          2
        )
      );


      const callback =
        req.body;


      /*
        PayHero callback structures can vary
        by account/API version.

        We therefore look for common
        transaction/reference fields.
      */

      const externalReference =
        callback.external_reference ||
        callback.externalReference ||
        callback.reference ||
        callback.data?.external_reference ||
        callback.data?.externalReference ||
        callback.data?.reference;


      const status =
        String(
          callback.status ||
          callback.data?.status ||
          ""
        ).toUpperCase();


      if (!externalReference) {

        return res.status(200).json({

          received: true

        });

      }


      const orders =
        readOrders();


      const order =
        orders.find(
          item =>
            item.orderId ===
            externalReference
        );


      if (!order) {

        return res.status(200).json({

          received: true

        });

      }


      /*
        Only mark PAID when the
        callback indicates success.
      */

      if (
        status === "SUCCESS" ||
        status === "COMPLETED" ||
        status === "PAID"
      ) {

        order.status = "PAID";

        order.paymentStatus = "PAID";

        order.paidAt =
          new Date().toISOString();

        order.callback =
          callback;

      }


      else if (
        status === "FAILED" ||
        status === "CANCELLED" ||
        status === "CANCELED"
      ) {

        order.status = "FAILED";

        order.paymentStatus =
          "FAILED";

        order.callback =
          callback;

      }


      else {

        order.callback =
          callback;

      }


      saveOrders(orders);


      return res.status(200).json({

        received: true

      });


    } catch (error) {

      console.error(
        "CALLBACK ERROR:",
        error
      );


      /*
        Still acknowledge callback
        to avoid unnecessary retries.
      */

      return res.status(200).json({

        received: true

      });

    }

  }
);


/* =========================
   GET ORDER STATUS
========================= */

app.get(
  "/api/orders/:orderId",
  (req, res) => {

    const orders =
      readOrders();


    const order =
      orders.find(
        item =>
          item.orderId ===
          req.params.orderId
      );


    if (!order) {

      return res.status(404).json({

        message:
          "Order not found."

      });

    }


    /*
      Do NOT expose sensitive
      PayHero credentials.
    */

    return res.json({

      orderId: order.orderId,

      status: order.status,

      paymentStatus:
        order.paymentStatus,

      amount: order.amount

    });

  }
);


/* =========================
   HEALTH CHECK
========================= */

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      status: "online",

      store:
        "MADAM EVA BOUTIQUE & FULL OUTFIT"

    });

  }
);


/* =========================
   FALLBACK
========================= */

app.get("*", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );

});


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  () => {

    console.log(
      `Madam Eva Boutique running on port ${PORT}`
    );

  }
);
