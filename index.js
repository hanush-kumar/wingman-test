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
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wingman Auth API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: white;
            border: 1px solid #ddd;
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
            padding: 30px;
        }
        h1 {
            color: #333;
            margin-bottom: 8px;
            font-size: 24px;
            font-weight: 500;
        }
        .subtitle {
            color: #777;
            margin-bottom: 25px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #555;
            font-size: 14px;
        }
        textarea {
            width: 100%;
            min-height: 300px;
            padding: 12px;
            border: 1px solid #ccc;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            resize: vertical;
        }
        textarea:focus {
            outline: none;
            border-color: #999;
        }
        .button-group {
            display: flex;
            gap: 8px;
            margin-top: 15px;
        }
        button {
            background: #555;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #444;
        }
        button.secondary {
            background: #e0e0e0;
            color: #333;
        }
        button.secondary:hover {
            background: #d0d0d0;
        }
        .response {
            margin-top: 25px;
            padding: 15px;
            display: none;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 500px;
            overflow-y: auto;
            line-height: 1.5;
            border: 1px solid #ddd;
        }
        .response.show {
            display: block;
        }
        .response.success {
            background-color: #f0f0f0;
            border-color: #999;
            color: #333;
        }
        .response.error {
            background-color: #f5f5f5;
            border-color: #999;
            color: #666;
        }
        .response.loading {
            background-color: #f5f5f5;
            border-color: #999;
            color: #666;
        }
        .status {
            font-weight: 500;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .loading-spinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid #ccc;
            border-radius: 50%;
            border-top-color: #666;
            animation: spin 1s linear infinite;
            margin-right: 6px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Wingman Auth API</h1>
        <p class="subtitle">Paste your JSON data below and click "Send Request" to verify</p>
        
        <div class="form-group">
            <label for="jsonInput">JSON Input:</label>
            <textarea id="jsonInput" placeholder='Paste your JSON here...'>{
  "po": "4500000052",
  "posupplier": "0011300001",
  "poamount": 5000,
  "pocurrency": "GBP",
  "potype": "NB",
  "poapproverlevel": "Level 1",
  "approvername": "ARAVINDH",
  "approvermail": "rajaravind@kaartech.com",
  "releasegroup": "Z1",
  "releasecode": "11",
  "workitem": 393091
}</textarea>
        </div>
        
        <div class="button-group">
            <button onclick="sendRequest()">Send Request</button>
            <button class="secondary" onclick="clearResponse()">Clear Response</button>
            <button class="secondary" onclick="formatJSON()">Format JSON</button>
        </div>
        
        <div id="response" class="response"></div>
    </div>

    <script>
        async function sendRequest() {
            const jsonInput = document.getElementById('jsonInput').value.trim();
            const responseDiv = document.getElementById('response');
            
            // Show loading state
            responseDiv.className = 'response show loading';
            responseDiv.innerHTML = '<div class="status"><span class="loading-spinner"></span>Sending request...</div>';
            
            try {
                // Validate JSON
                const jsonData = JSON.parse(jsonInput);
                
                // Get current URL and construct API endpoint
                const baseUrl = window.location.origin;
                const apiUrl = baseUrl + '/api/verify';
                
                // Get credentials from browser prompt
                const username = 'admin';
                const password = 'password123';
                const auth = btoa(\`\${username}:\${password}\`);
                
                // Send POST request
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Basic \${auth}\`
                    },
                    body: JSON.stringify(jsonData)
                });
                
                const responseData = await response.json();
                
                if (response.ok) {
                    responseDiv.className = 'response show success';
                    responseDiv.innerHTML = \`<div class="status">✓ Success (Status: \${response.status})</div>\${JSON.stringify(responseData, null, 2)}\`;
                } else {
                    responseDiv.className = 'response show error';
                    responseDiv.innerHTML = \`<div class="status">✗ Error (Status: \${response.status})</div>\${JSON.stringify(responseData, null, 2)}\`;
                }
            } catch (error) {
                responseDiv.className = 'response show error';
                if (error instanceof SyntaxError) {
                    responseDiv.innerHTML = \`<div class="status">✗ Invalid JSON</div>Error: \${error.message}\\n\\nPlease check your JSON format and try again.\`;
                } else {
                    responseDiv.innerHTML = \`<div class="status">✗ Request Failed</div>Error: \${error.message}\\n\\nMake sure:\\n1. Your server is running\\n2. The JSON is valid\\n3. You have entered the correct credentials\`;
                }
            }
        }
        
        function clearResponse() {
            const responseDiv = document.getElementById('response');
            responseDiv.className = 'response';
            responseDiv.innerHTML = '';
        }
        
        function formatJSON() {
            const textarea = document.getElementById('jsonInput');
            try {
                const json = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(json, null, 2);
            } catch (error) {
                alert('Invalid JSON. Cannot format.');
            }
        }
        
        // Allow Ctrl+Enter to send request
        document.getElementById('jsonInput').addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                sendRequest();
            }
        });
    </script>
</body>
</html>
  `);
});

// Logout endpoint to clear cached credentials
app.get("/api/logout", (_req, res) => {
  res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.status(401).send("Logged out. Please re-authenticate.");
});

// Echo back request data to confirm receipt
app.post("/api/verify", basicAuth, (req, res) => {
  res.json({
    message: "response reached",
    ...req.body
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
