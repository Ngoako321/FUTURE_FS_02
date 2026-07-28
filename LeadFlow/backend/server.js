require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');

const app = express();


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

app.get("/api/leads", (req, res) => {

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

app.post("/api/leads", (req, res) => {

    const {
        full_name,
        company,
        email,
        phone,
        source, 
        status,
        notes
    } = req.body;


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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


