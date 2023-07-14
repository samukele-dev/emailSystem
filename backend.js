// Import necessary modules and set up Express app
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mailchimp = require('@mailchimp/mailchimp_marketing');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Configure Mailchimp API key and list ID
mailchimp.setConfig({
    apiKey: '9e98e889029e03a3ee5bbb5c4c3ec441-us21',
    server: 'us21',
});

// Serve the HTML template
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/subscribe.html');
});

// Handle form submission to subscribe
app.post('/subscribe', async(req, res) => {
    const { email } = req.body;

    try {
        // Check if the email is already subscribed
        const response = await mailchimp.lists.getListMember('221f70b044', md5(email));
        if (response.status === 200 && response.data.status === 'subscribed') {
            res.send('Email is already subscribed');
            return;
        }
    } catch (error) {
        console.error('Error checking subscriber status:', error);
    }

    try {
        // Add the email to the Mailchimp list
        const subscriber = await mailchimp.lists.addListMember('221f70b044.', {
            email_address: email,
            status: 'pending',
            merge_fields: {
                // Add any additional merge fields as needed
            },
        });

        // Generate an activation token
        const activationToken = uuidv4();

        // Send the activation email to the subscriber
        const activationLink = `http://your-website.com/activate/${activationToken}`;
        const mailchimpResponse = await mailchimp.messages.send({
            message: {
                subject: 'Activate Your Subscription',
                html: `<p>Click the following link to activate your subscription: <a href="${activationLink}">${activationLink}</a></p>`,
                from_email: 'sender@example.com',
                to: [{ email: email }],
            },
        });

        console.log('Email sent to Mailchimp:', mailchimpResponse);

        // You can store the activation token and subscriber details in your database for further processing

        res.send('Activation email sent!');
    } catch (error) {
        console.error('Error subscribing and sending activation email:', error);
        res.status(500).send('Error subscribing and sending activation email');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});