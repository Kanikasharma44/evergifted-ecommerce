const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files from the current directory
app.use(express.static(__dirname));

// Ensure messages.json exists
const messagesFilePath = path.join(__dirname, 'messages.json');
if (!fs.existsSync(messagesFilePath)) {
    fs.writeFileSync(messagesFilePath, '[]', 'utf8');
}

// API Endpoint to handle contact form submissions
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newMessage = {
        name,
        email,
        subject: subject || 'No Subject',
        message,
        date: new Date().toISOString()
    };

    // Read existing messages
    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing messages.json at", new Date().toISOString(), e);
            }
        }

        // Add the new message
        messages.push(newMessage);

        // Save back to the file
        fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Error writing to messages.json at", new Date().toISOString(), err);
                return res.status(500).json({ error: 'Failed to save message.' });
            }
            res.status(201).json({ success: true, message: 'Message sent successfully!' });
        });
    });
});

// Fallback for HTML request -> serve index.html
app.use((req, res, next) => {
    // If request accepts html and doesn't explicitly target a file, serve index.html
    if (req.accepts('html') && !req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        next();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('You can now open your browser and view the site.');
});
