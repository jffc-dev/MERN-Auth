import { User } from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"

export const signup = async (req, res)=> {
    const {email, password, name} = req.body
    
    try {
        if(!email || !password || !name){
            throw new Error('All fields are required')
        }

        const userAlreadyExists = await User.findOne({email})
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: 'user already exists'})
        }
        const hashedPassword = await bcryptjs.hash(password, 10)
        const verificationToken = generateVerificationToken()
        const user = new User({email, password: hashedPassword, name, verificationToken, verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000})
        
        await user.save()
        generateTokenAndSetCookie(res, user._id)
        sendVerificationEmail(user.email, verificationToken)

        return res.status(200).json({success: true, message: 'user created successfully', user: {
            ...user._doc, password: undefined
        }})
    } catch (error) {
        return res.status(400).json({success: false, message: error.message})
    }
}

export const login = async (req, res)=> {
    res.send("login route")
}

export const logout = async (req, res)=> {
    res.send("logout route")
}

export const verifyEmail = async (req, res)=> {
    const {code} = req.body

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({status: false, message: 'Invalid or expired verification token'})
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        return res.status(200).json({success: true, message: 'Email verified successfully', user: {
            ...user._doc, password: undefined
        }})

    } catch (error) {
        return res.status(400).json({success: false, message: error.message})
    }
}