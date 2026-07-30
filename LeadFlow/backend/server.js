require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const authenticateToken = require("./middleware");


//Middleware
app.use(cors());
app.use(express.json());

// Database Connection

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {

    if (err) {
        console.log("Database Connection Failed");
        console.log(err);
        return;
    } 

    console.log("Connected to MySQL");
});

//-------- Home route -----------

app.get("/", (req, res) => {
    res.send("LeadFlow CRM API Runninng...");
});

//-----------Get All Leads---------

app.get("/api/leads", authenticateToken , (req, res) => {

    const sql = "SELECT * FROM leads ORDER BY id DESC";

    db.query(sql, (err, result) => {

        if (err) {
            console.error("Error fetching leads:", err);

            return res.status(500).json({
                message: "Could not fetch leads"
            });
        }

        res.json(result);
    });

});


//---------- Add New Lead--------

app.post("/api/leads", authenticateToken , (req, res) => {

    const { full_name, company, email, phone, source, status, notes} = req.body;


    // Basic validation
    if (!full_name || !company || !email || !source || !status) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }

    const sql = `
    INSERT INTO leads
    (full_name, company, email, phone, source, status, notes)
    VALUES (?,?,?,?,?,?,?)
    `;

    db.query(
        sql, 
        [full_name, company, email, phone, source, status, notes],
        (err, result) => {

            if (err) {

                console.error("Error adding lead:", err);

                return res.status(500).json({
                    message: "Could not add lead"
                });
            }

            res.status(201).json({
                message: "Lead Added Successfully!",
                leadId: result.insertId
            });
        }
    );
});

// -------- User SignUp ----------
app.post("/api/signup", async (req, res) => {

    const { first_name, last_name, email, password } = req.body;

    const full_name = `${first_name} ${last_name}`.trim();

    if (!full_name || !email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields."
        });
    }

    try {

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {

                if (err) {
                    console.error("SELECT ERROR:", err);
                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already exists."
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(
                    `INSERT INTO users
                    (full_name, email, password)
                    VALUES (?, ?, ?)`,
                    [full_name, email, hashedPassword],
                    (err) => {

                        if (err) {
                            console.error("SIGNUP ERROR:", err);
                            return res.status(500).json({
                                message: err.message
                            });
                        }

                        res.status(201).json({
                            message: "Account created successfully!"
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error."
        });

    }

});

//---------User Login ---------


app.post("/api/login", (req,res) => {

    const { email, password} = req.body;
 
    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter your email and password."
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                console.error("LOGIN ERROR:", err);
                return res.status(500).json({
                    message: "Database error."
                });
            }
            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invaild email or password."
                })
            }
            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password."
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                }
            );

            res.json({
                message: "Login successful!",
                token
            });
        }
    );
});

app.get("/api/me", authenticateToken, (req, res) => {

    db.query(
        "SELECT id, full_name, email, role FROM users WHERE id = ?",
        [req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found."
                });
            }

            res.json(results[0]);

        }
    );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


