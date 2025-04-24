import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import * as argon2 from "argon2";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "learning",
  password: "henrusdan",
  port: 5432,
});

db.connect();

const app = express();
// app.use(express.json());
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

//This function takes the values from the form
async function register(req, res, next) {
  const { firstName, lastName, email, tel, password } = req.body;

  const isDuplicate = await db.query(
    `SELECT * FROM  user_data1 WHERE email='${email}' OR tel='${tel}'` //Check if its a duplicate
  );
  if (isDuplicate?.rowCount && isDuplicate.rowCount >= 1) {
    return res.status(422).json({ message: "Email/phone number is taken" });
  }
  const hashedPassword = await argon2.hash(password);
  await db.query(
    "INSERT INTO user_data1 (fname, lname, email, tel, password) VALUES ($1, $2, $3, $4, $5)", //Then update the data to the database
    [firstName, lastName, email, tel, hashedPassword]
  );
  return res.json({ message: "registered successfully" });
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userInfo = await db.query(
    `SELECT * FROM  user_data1 WHERE email='${email}' LIMIT 1` //Searches the databse for the email, to be able to tap into the password
  );

  console.log(userInfo);
  if (userInfo.rowCount == 0) {
    return res.status(404).json({ message: "Invalid Email/Password" });
  }
  const user = userInfo.rows[0];
  const ispasswordMatch = await argon2.verify(user.password, password);
  if (!ispasswordMatch) {
    return res.status(404).json({ message: "Invalid Password" });
  }
  res
    .cookie("user", JSON.stringify(structuredClone(user)), { httpOnly: false })
    .sendFile(
      "/Users/henryojegwo/Desktop/FINAL YEAR CODE/LOGIN PAGE/landing.html"
    );
});

app.post("/register", register, (req, res) => {});

// Add a new endpoint to delete a user by email
app.delete("/delete-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.query("DELETE FROM user_data1 WHERE email = $1", [
      email,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});

db.end;
