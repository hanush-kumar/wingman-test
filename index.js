const express = require("express");
const app = express();

const USERNAME = "admin";
const PASSWORD = "password123";

function basicAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).send("Authentication required");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  if (username === USERNAME && password === PASSWORD) {
    next();
  } else {
    res.status(401).send("Invalid credentials");
  }
}

app.get("/", (_req, res) => {
  res.send("Wingman Auth API is running");
});

app.get("/api/verify", basicAuth, (req, res) => {
  res.json({
    message: "Authentication successful",
    status: "response reached"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
