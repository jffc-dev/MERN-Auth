import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, mailtrapSender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

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

export const sendWelcomeEmail = async(email, name) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: 'Welcome',
            html: WELCOME_EMAIL_TEMPLATE.replace('{userName}', name),
            category: 'Welcome email'
        })

        console.log('Email sends successfully', response);

    } catch (error) {
        console.log('Error welcome sending', error.message);
        throw new Error(`Error welcome sending ${error.message}`)
    }
}

export const sendPasswordResetEmail = async(email, resetUrl) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetUrl),
            category: 'Reset password'
        })
        console.log('Email sends successfully', response);

    } catch (error) {
        console.log('Error reset password', error.message);
        throw new Error(`Error reset password ${error.message}`)
    }
}