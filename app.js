const express = require("express");
const app = express();
const port = 4500;
const users = {};
const INTEREST_RATE = 0.1;
const MONTHS = 5;
let monthlyPayment;

// parse application/json
app.use(express.json());

app.post("/add-user", (req, res) => {
  const username = req.body["name"];
  const group = req.body["group"];
  const loan = req.body["loan"];
  const id = req.body["id"];
  if (!users[group]) {
    users[group] = {};
  }
  users[group][id] = {
    username,
    group,
    loan,
    id,
    payments: [],
  };
  res.status(200).json({
    allUsers: users,
    message: "user added successfully",
  });
});

app.post("/request-loan", (req, res) => {
  const group = req.body["group"];
  const loan = req.body["loan"];
  const id = req.body["id"];
  if (users[group] && users[group][id]["outstandingBalance"] <= 0) {
    users[group][id]["loan"] = loan;
    users[group][id]["payments"] = [];
    users[group][id]["interestPaid"] = "";
    users[group][id]["outstandingBalance"] = "";
    users[group][id]["principalPaid"] = "";
    users[group][id]["monthlyPayment"] = "";
    users[group][id]["amountPaid"] = "";
    res.status(200).json({
      msg: "loan granted",
      user: users[group][id],
    });
  } else {
    res.status(200).json({
      msg: "you have balance to pay from prev loan Or User doesn't exist",
    });
  }
});

app.get("/view-payments/:group/:id", (req, res) => {
  const id = req.params["id"];
  const group = req.params["group"];
  res.status(200).json({
    msg: "success",
    details: (users[group] && users[group][id]) || {},
  });
});

app.post("/submit-payment", (req, res) => {
  try {
    const id = req.body["id"];
    const group = req.body["group"];
    let interestPaid;
    let outstandingBalance;
    let principalPaid;
    let user = users[group][id];
    let loan = user["loan"];
    let amountPaid;
    monthlyPayment =
      loan *
      INTEREST_RATE *
      ((1 + INTEREST_RATE) ** MONTHS / ((1 + INTEREST_RATE) ** MONTHS - 1));

    interestPaid = loan * INTEREST_RATE;
    if (user["payments"].length >= MONTHS) {
      user["payments"].pop();
    }
    if (user["payments"].length) {
      let latestBalance = user["payments"][user["payments"].length - 1];
      interestPaid = latestBalance * INTEREST_RATE;
      principalPaid = monthlyPayment - interestPaid;
      outstandingBalance = latestBalance - principalPaid;
      if (outstandingBalance < 0) {
        user["payments"].push(0);
      } else {
        user["payments"].push(Math.round(outstandingBalance));
      }
    } else {
      interestPaid = loan * INTEREST_RATE;
      principalPaid = monthlyPayment - interestPaid;
      outstandingBalance = loan - principalPaid;
      user["payments"].push(Math.round(outstandingBalance));
    }
    user["interestPaid"] = +interestPaid.toFixed(0);
    user["outstandingBalance"] =
      outstandingBalance < 0 ? 0 : Math.round(outstandingBalance);
    user["principalPaid"] = +principalPaid.toFixed(0);
    user["monthlyPayment"] = +monthlyPayment.toFixed(0);
    amountPaid = user["payments"].length * monthlyPayment;
    user["amountPaid"] = +amountPaid.toFixed(0);

    if (user["outstandingBalance"]) {
      res.status(200).json({
        user,
      });
    } else {
      res.json({
        message: "no pending debt!",
      });
    }
  } catch (error) {
    res.json({
      message: "Please ensure you are registered!",
    });
  }
});

app.get("/users", (req, res) => {
  res.status(200).json({
    data: users,
    status: "success",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
