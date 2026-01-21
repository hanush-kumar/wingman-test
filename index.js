const express = require("express");
const app = express();

app.use(express.json()); // parse JSON bodies

const USERNAME = "admin";
const PASSWORD = "password123";

function basicAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(401).send("Authentication required");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  if (username === USERNAME && password === PASSWORD) {
    next();
  } else {
    // Always send WWW-Authenticate header to force browser to re-prompt
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(401).send("Invalid credentials");
  }
}

app.get("/", (_req, res) => {
  res.send("Wingman Auth API is running");
});

// Logout endpoint to clear cached credentials
app.get("/api/logout", (_req, res) => {
  res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.status(401).send("Logged out. Please re-authenticate.");
});

// Echo back request data and headers to confirm receipt
app.post("/api/verify", basicAuth, (req, res) => {
  res.json({
    message: "response reached",
    headers: req.headers,
    data: req.body
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
