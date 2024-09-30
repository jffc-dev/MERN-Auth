import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, mailtrapSender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = {name}

    try {
        const response = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: 'Verify your email',
            html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
            category: 'Email Verification'
        })

        console.log('Email sends successfully', response);
        
    } catch (error) {
        console.log('Error sending verification', error.message);
        throw new Error(`Error sending verification ${error.message}`)
        
    }
}