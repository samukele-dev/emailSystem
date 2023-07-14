// Import necessary modules and set up Express app
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Create a new PostgreSQL connection pool
const pool = new Pool({
    user: 'your_username',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432, // Default PostgreSQL port
});

// Create the subscribers table if it doesn't exist
pool.query(
        `CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
  );`
    )
    .then(() => {
        console.log('Subscribers table created or already exists');
    })
    .catch((error) => {
        console.error('Error creating subscribers table:', error);
    });

// Serve the HTML template
app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'templates', 'subscribe.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading template file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(data);
        }
    });
});

// Handle form submission to subscribe
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    // Save the email to the database
    const query = 'INSERT INTO subscribers (email) VALUES ($1)';
    const values = [email];

    pool.query(query, values)
        .then(() => {
            console.log('Email saved to the database');
            res.send('Subscription successful!');
        })
        .catch((error) => {
            console.error('Error saving email to the database:', error);
            res.status(500).send('Error saving email to the database');
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});