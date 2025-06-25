import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import * as argon2 from "argon2";
import multer from "multer";
import path from "path";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//This is accessing the databse using db connect
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "learning",
  password: "henrusdan",
  port: 5432,
});

db.connect();

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

//Customer - LATOYA
//Post request (endpoint) to be done when login button is pressed

const adminEmail = "admin@nileuniversity.edu.ng";
const adminPassword = "unitrade";
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === adminEmail && password === adminPassword) {
    // If the user is an admin, send them to the admin page
    return res.sendFile(__dirname + "/Admin/admin_landing.html");
  } else {
    //If the email and password are not the same as the admin, it will search for the user in the database

    const userInfo = await db.query(
      `SELECT * FROM  user_data1 WHERE email='${email}' LIMIT 1`
      //Searches the databse for the email, to be able to tap into the password
    );

    if (userInfo.rowCount == 0) {
      return res.status(404).json({ message: "Invalid Email/Password" });
    }

    //Since the password is hashed it uses the argon to unhash it and compare with user input
    const user = userInfo.rows[0];
    if (!user.isactive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }
    const ispasswordMatch = await argon2.verify(user.password, password);
    if (!ispasswordMatch) {
      return res.status(404).json({ message: "Invalid Password" });
    }
    //returns the cookie (which is current user data) because we need to upload profile data
    res
      .cookie("user", JSON.stringify(structuredClone(user)), {
        httpOnly: false,
      })
      .sendFile(__dirname + "/landing.html");
  }
});

app.get("/get-all-users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM user_data1");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoint to display login page when the page is loaded
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

//endpoint to send the register page when the page is loaded
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

//This function takes the values from the form and stores on the databse
async function register(req, res, next) {
  const { firstName, lastName, email, tel, password } = req.body;

  //Check wether the email or phone number have been registered before, as they are unique properties.
  const isDuplicate = await db.query(
    `SELECT * FROM  user_data1 WHERE email='${email}' OR tel='${tel}'` //Check if its a duplicate
  );
  if (isDuplicate?.rowCount && isDuplicate.rowCount >= 1) {
    return res.status(422).json({ message: "Email/phone number is taken" });
  }
  //password is hashed and then stored in the database
  const hashedPassword = await argon2.hash(password);
  await db.query(
    "INSERT INTO user_data1 (fname, lname, email, tel, password) VALUES ($1, $2, $3, $4, $5)", //Then update the data to the database
    [firstName, lastName, email, tel, hashedPassword]
  );
  return res.json({ message: "registered successfully" });
}

//This posts the info in the register function when the register button is clicked
app.post("/register", register, (req, res) => {});

//This endpoint is called when the user wants to update their profile
app.put("/update-user", async (req, res) => {
  console.log("Update user endpoint called");
  const { fname, lname, tel, email } = req.body;

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!fname || !lname || !tel) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.query(
      "UPDATE user_data1 SET fname = $1, lname = $2, tel = $3 WHERE email = $4",
      [fname, lname, tel, email]
    );

    // Return the updated user data after a successful update
    const updatedUser = await db.query(
      "SELECT fname, lname, tel, email FROM user_data1 WHERE email = $1",
      [email]
    );

    if (updatedUser.rowCount > 0) {
      res.json(updatedUser.rows[0]); // Return the updated user data
    } else {
      res.status(404).json({ message: "User not found after update." });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint is to update the password
app.put("/update-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user exists
    const userInfo = await db.query(
      `SELECT * FROM user_data1 WHERE email = $1`,
      [email]
    );

    if (userInfo.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordMatch = await argon2.verify(oldPassword, newPassword);
    if (isOldPasswordMatch) {
      return res
        .status(401)
        .json({ message: "New Password and old Password can not be the same" });
    }

    // Hash the new password and update it in the database
    const hashedNewPassword = await argon2.hash(newPassword);
    await db.query("UPDATE user_data1 SET password = $1 WHERE email = $2", [
      hashedNewPassword,
      email,
    ]);
    console.log("Password");
    res.json({
      message: "Password updated successfully. You will be logged out",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// This endpoint deletes user data when it is called from the profile.js
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
//END OF LATOYA MODULE

//QUIKSELL MODULE

// Configure multer to save images to a folder (e.g., /uploads)
app.use(cors());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
    //Puts the uploaded picture in the uploads folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
    //Generates the file name using the date and day
  },
});

//This makes sure that it is sent in .png form
const upload = multer({ storage: storage });

//endpoint that is called and then uploads the image to the file
app.post("/quiksell_upload", upload.single("image"), async (req, res) => {
  // console.log(req.body);
  console.log("This is it");
  const { pName, description, price, userName, email, phoneNumber } = req.body;
  const timestamp = new Date(); // Get the current timestamp
  console.log(req.file);

  if (!pName || !description || !price || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //image is the file path and then stored on the database as the file path
  const image = req.file.path;
  try {
    await db.query(
      "INSERT INTO quiksell (name, description, price, image, user_name, email, phonenumber, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        pName,
        description,
        price,
        image,
        userName,
        email,
        phoneNumber,
        timestamp,
      ]
    );

    res.json({ message: "Product uploaded successfully" });
  } catch (error) {
    console.error("Error uploading product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/activate-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.query(
      "UPDATE user_data1 SET isactive = true WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User activated successfully" });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/deactivate-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.query(
      "UPDATE user_data1 SET isactive = false WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// This is an endpoint that only gets products that have been on the database for less than 24 hours.
app.post("/get-products", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM quiksell WHERE createdat >= NOW() - INTERVAL '24 HOURS'`
    );
    const wishList = await db.query(
      `SELECT * FROM wishlist WHERE userid = $1`,
      [req.body.userId]
    );
    result.rows.forEach((product) => {
      const isInWishlist = wishList.rows.some(
        (item) => item.productid === product.id
      );
      product.isInWishlist = isInWishlist;
    });
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get-description", async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const result = await db.query(`SELECT * FROM quiksell WHERE id = $1`, [
      productId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product description:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/toggle-wishlist", async (req, res) => {
  const { userId, productId } = req.body;
  console.log("Toggle wishlist endpoint called");
  console.log(userId, productId);

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "User ID and Product ID are required" });
  }

  try {
    // Check if the product is already in the wishlist
    const existingProduct = await db.query(
      "SELECT * FROM wishlist WHERE userid = $1 AND productid = $2",
      [userId, productId]
    );

    if (existingProduct.rowCount > 0) {
      // If it exists, remove it from the wishlist
      await db.query(
        "DELETE FROM wishlist WHERE userid = $1 AND productid = $2",
        [userId, productId]
      );
      res.json({ message: "Product removed from wishlist" });
    } else {
      // If it doesn't exist, add it to the wishlist
      await db.query(
        "INSERT INTO wishlist (userid, productid) VALUES ($1, $2)",
        [userId, productId]
      );
      res.json({ message: "Product added to wishlist" });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get_wishlist", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Updated query to exclude expired products (uploaded more than 24 hours ago)
    const userWishlist = await db.query(
      `SELECT * FROM wishlist 
       WHERE userid = $1 
       AND productid IN (
         SELECT id FROM quiksell WHERE createdat >= NOW() - INTERVAL '24 HOURS'
       )`,
      [userId]
    );
    const products = await db.query(
      `SELECT * FROM quiksell WHERE id = ANY($1::int[])`,
      [userWishlist.rows.map((item) => item.productid)]
    );
    res.json(
      products.rows.map((product) => {
        const isInWishlist = userWishlist.rows.some(
          (item) => item.productid === product.id
        );
        return { ...product, isInWishlist };
      })
    );
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/my-quiksell", async (req, res) => {
  const { email } = req.body; // Use req.body to get the email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const products = await db.query(
      `SELECT * FROM quiksell 
       WHERE email = $1 
       AND createdat >= NOW() - INTERVAL '24 HOURS'`,
      [email]
    );
    res.json(products.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/delete-quiksell", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const result = await db.query("DELETE FROM quiksell WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//DELIVERY MODULE - AKITOYE
// This endpoint is called when the delivery button is clicked
app.post("/delivery_upload", async (req, res) => {
  const {
    deliveryName,
    deliveryEmail,
    deliveryPhoneNumber,
    deliverFrom,
    deliverTo,
    availableFor,
  } = req.body;

  if (
    !deliveryName ||
    !deliveryEmail ||
    !deliveryPhoneNumber ||
    !deliverFrom ||
    !deliverTo ||
    !availableFor
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //Inserts the data into the database
  try {
    await db.query(
      "INSERT INTO delivery (deliveryname, deliverymail, deliverytel, leavingfrom, gettingto, timeavailable) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        deliveryName,
        deliveryEmail,
        deliveryPhoneNumber,
        deliverFrom,
        deliverTo,
        availableFor,
      ]
    );

    res.json({ message: "Delivery request uploaded successfully" });
  } catch (error) {
    console.error("Error uploading delivery request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Updated endpoint to fetch delivery helpers, including those expired within the last 10 minutes
app.get("/get-deliveries", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *, (deliverycreate + (timeavailable || ' minutes')::interval) AS expiry_time 
       FROM delivery 
       WHERE (deliverycreate + (timeavailable || ' minutes')::interval) > NOW() - INTERVAL '10 minutes'`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/log-delivery", async (req, res) => {
  console.log("Log delivery endpoint called");
  const {
    userId,
    userMail,
    userTel,
    userName,
    clientName,
    clientTel,
    deliveryType,
    pickupLocation,
    dropoffLocation,
    packageDescription,
  } = req.body;
  if (
    !userId ||
    !userMail ||
    !userTel ||
    !userName ||
    !clientName ||
    !clientTel ||
    !pickupLocation ||
    !dropoffLocation ||
    !packageDescription
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    await db.query(
      "INSERT INTO deliverylogs (helperid, helpermail, helpertel, helpername, clientname, clienttel, deliverytype, pickuplocation, dropofflocation, packagedescription) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        userId,
        userMail,
        userTel,
        userName,
        clientName,
        clientTel,
        deliveryType,
        pickupLocation,
        dropoffLocation,
        packageDescription,
      ]
    );

    console.log("Delivery logged successfully");

    res.json({ message: "Delivery logged successfully" });
  } catch (error) {
    console.error("Error logging delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Updated endpoint to handle POST request for fetching deliveries
app.post("/my-deliveries", async (req, res) => {
  const { email } = req.body; // Use req.body to get the email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const deliveries = await db.query(
      `SELECT * FROM delivery 
       WHERE deliverymail = $1 
       AND (deliverycreate + (timeavailable || ' minutes')::interval) > NOW()`,
      [email]
    );
    res.json(deliveries.rows);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// This endpoint deletes delivery data when it is called from the profile.js
app.delete("/delete-delivery", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const result = await db.query("DELETE FROM delivery WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});

//DEREK's Module
app.post("/vendor-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM vendors WHERE email = $1", [
      email,
    ]);
    const vendor = result.rows[0];

    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: vendor.id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token, vendor });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/vendor-registration", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO vendors (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, phone]
    );
    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: result.rows[0],
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Vendor registration failed" });
  }
});

app.post("/vendor-profile", async (req, res) => {
  console.log("was i Called");
  const { vendor } = req.body;

  try {
    const result = await db.query(
      `
          SELECT id, name, email, phone, store_name, store_description, profile_picture 
          FROM vendors 
          WHERE id = $1
        `,
      [vendor]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.post("/upload-products", upload.single("image"), async (req, res) => {
  // console.log("📥 Incoming Data:", req.body);
  console.log(req.body);

  try {
    const currentDB = await db.query("SELECT current_database();");
    console.log("🗔️ Connected to DB:", currentDB.rows[0].current_database);
  } catch (err) {
    console.error("❌ Failed to check current DB:", err);
  }

  let { vendor_id, name, price, description, quantity, category, condition } =
    req.body;
  const image = req.file ? req.file.filename : null;

  // ✅ Normalize category (capitalize first letter, rest lowercase)
  if (category) {
    category =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  console.log(`Captured => Category: ${category}, Condition: ${condition}`);

  try {
    const query = `
          INSERT INTO products (vendor_id, name, price, description, quantity, category, condition, image)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
      `;
    const values = [
      vendor_id,
      name,
      price,
      description,
      quantity,
      category,
      condition,
      image,
    ];

    console.log("🚀 Query Values:", values);

    const result = await db.query(query, values);

    console.log("✅ Saved Product:", result.rows[0]);

    res.status(201).json({
      message: "Product added successfully!",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.post("/get-vendor-products", async (req, res) => {
  const { vendor_id } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM products WHERE vendor_id = $1",
      [vendor_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.delete("/delete-product", async (req, res) => {
  const { id } = req.body;

  try {
    const result = await db.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({
      message: "Product deleted successfully!",
      deletedProduct: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.post("/category-products", async (req, res) => {
  console.log("category endpoint was called");
  const { category } = req.body;

  try {
    console.log("🧪 Category param:", category); // Log the incoming param

    const result = await db.query(
      "SELECT * FROM products WHERE LOWER(category) = LOWER($1)",
      [category]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching category products:", err);
    res.status(500).json({ error: "Failed to load category products" });
  }
});

app.post("/description", async (req, res) => {
  const { product_Id } = req.body;

  try {
    const result = await db.query(
      `SELECT 
            products.*, 
            vendors.name AS vendor_name, 
            vendors.phone AS vendor_phone
        FROM products
        JOIN vendors ON products.vendor_id = vendors.id
        WHERE products.id = $1`,
      [product_Id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching product description:", err);
    res.status(500).json({ error: "Failed to load description" });
  }
});

// ✅ Get Featured Products (for Landing Page)
app.get("/featured-products", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC LIMIT 6"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching featured products:", err);
    res.status(500).json({ error: "Failed to load featured products" });
  }
});

app.post("/vendorprofile", async (req, res) => {
  console.log("I returned the frontend data");
  const { id } = req.body;

  try {
    const result = await db.query(
      `
          SELECT id, name, email, phone, store_name, store_description, profile_picture 
          FROM vendors 
          WHERE id = $1
        `,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// app.put("/updatevendorprofile", async (req, res) => {
//   const { id } = req.params;
//   const { storeName, storeDescription } = req.body;
//   // const { name, email, phone } = req.body;

//   try {
//     const result = await db.query(
//       "UPDATE vendors SET store_name = $1, store_description = $2 WHERE id = $3 RETURNING *",
//       [storeName, storeDescription, id]
//     );

//     res.json({ message: "Profile updated", vendor: result.rows[0] });
//   } catch (err) {
//     console.error("Profile Update Error:", err.message); // ✅ Leave this for debugging
//     res.status(500).json({ error: "Failed to update profile" });
//   }
// });

db.end;
