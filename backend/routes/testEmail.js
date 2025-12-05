const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.get('/', async (req, res) => {
    try {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASSWORD;

        if (!user || !pass) {
            return res.status(500).json({
                error: 'Missing Credentials',
                details: {
                    user: user ? 'Defined' : 'Missing',
                    pass: pass ? 'Defined' : 'Missing'
                }
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });

        // 1. Verify Connection
        await transporter.verify();

        // 2. Send Test Email
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: 'Test Diagnostic Arbre à Palabres',
            text: 'Si vous recevez ceci, la configuration est correcte !'
        });

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            config: {
                user: user,
                passLength: pass ? pass.length : 0
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
    }
});

module.exports = router;
