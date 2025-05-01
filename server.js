const express = require("express");
const mysql = require("mysql2/promise"); // Using promise-based API
const app = express();
const port = 3000;

let connection;
// Serve static files from the "public" directory
app.use(express.static("public"));

app.use(express.json()); // ✅ Must be at the top

// Start the server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});

app.post("/api/register_donation", async (req, res) => {
  if (req.body.instituicao == undefined || req.body.valor == undefined) {
    return res.status(400).send('Error: "name and isntituicao" is required');
  }
  var user = req.body.user_id ?? null;
  const sql = `INSERT INTO doacoes(user_id, instituicao, valor) VALUES (?,?,?)`;
  const values = [user, req.body.instituicao, req.body.valor];
  try {
    const [rows] = await connection.execute(sql, values);
    console.log(rows.insertId);
    return res.send(rows.insertId);
  } catch (err) {
    console.error("Error occurred:", err);
    return res.status(403).send(err);
  }
});

// MySQL connection setup
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "RuaSolidaria",
};

// Connect to MySQL when server starts
async function connectToDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}
connectToDB().then(() => {});
// await connectToDB();
