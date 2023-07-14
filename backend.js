const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve the HTML template
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/subscribe.html');
});

// Handle form submission to subscribe
app.post('/subscribe', async(req, res) => {
    const { email } = req.body;

    try {
        // Save the email to Mailchimp list
        const data = {
            members: [{
                email_address: email,
                status: 'pending',
            }],
        };

        await axios({
            method: 'post',
            url: `https://usX.api.mailchimp.com/3.0/221f70b044/members`,
            data: JSON.stringify(data),
            auth: {
                username: 'samukele107@gmail.com',
                password: '9e98e889029e03a3ee5bbb5c4c3ec441-us21',
            },
        });

        // Send the activation email
        const transporter = nodemailer.createTransport({
            service: 'your_email_service',
            auth: {
                user: 'your_email_username',
                pass: 'your_email_password',
            },
        });

        const mailOptions = {
            from: 'sender@example.com',
            to: email,
            subject: 'Activation Email',
            text: 'Please activate your subscription',
            html: '<p>Please click the following link to activate your subscription: <a href="YOUR_ACTIVATION_LINK">Activate</a></p>',
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending activation email:', error);
                res.status(500).send('Error sending activation email');
            } else {
                console.log('Activation email sent:', info.response);
                res.send('Subscription successful! Activation email sent');
            }
        });
    } catch (error) {
        console.error('Error subscribing and saving email:', error);
        res.status(500).send('Error subscribing');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});