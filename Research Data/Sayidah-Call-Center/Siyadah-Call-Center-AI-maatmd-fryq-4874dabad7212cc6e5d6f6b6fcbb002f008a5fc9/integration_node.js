const express = require('express');
const WhatsAppClient = require('./whatsaapp_client_nodejs/WhatsAppClient');
const axios = require('axios');

const app = express();
app.use(express.json());

// Initialize WhatsApp client
const whatsappClient = new WhatsAppClient(
    "mohamed_session",
    null,
    "comp_mc7awp6j_6ef95dac217e7acc7d80041077ff5413"
);


// Add the webhook route to your main Express app
app.post('/webhook', (req, res) => {
    /**
     * Handle incoming webhook from WhatsApp server
     */
    try {
        const data = req.body;
        if (data) {
            // Process the webhook data same way as the client
            const messageInfo = {
                from: data.from || 'unknown',
                body: data.body || data.text || 'N/A',
                type: data.type || 'text',
                timestamp: data.timestamp || 0,
                session: data.session || 'unknown',
                event: data.event || 'message'
            };
            
 
            
            // Log the message
            console.log(`📱 Received: ${messageInfo.body} from ${messageInfo.from}`);
            console.log(messageInfo)
        }
        
        res.json({ status: 'ok' });
    } catch (error) {
        console.log(`Webhook error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});


async function main() {
    // Configure server webhook to point to this app
    try {
        const response = await axios.post(
            `${whatsappClient.serverUrl}/api/webhook/configure`,
            { webhookUrl: "https://dc69-197-17-32-151.ngrok-free.app/webhook" },
            { timeout: 10000 }
        );
        console.log(`Webhook configured: ${response.status}`);
    } catch (error) {
        console.log(`Webhook config error: ${error.message}`);
    }
    
    // Send test message
    const success = await whatsappClient.sendMessage("+21621219217", "How can I assist you?");
    console.log(`Test message sent: ${success}`);

    // Run the main Express app with webhook handler
    app.listen(3000, '0.0.0.0', () => {
        console.log('Server running on port 3000');
    });
}

if (require.main === module) {
    main().catch(console.error);
}