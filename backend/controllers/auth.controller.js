import { User } from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"

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
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, message: 'Invalid credentials'}) 
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)
        
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: 'Invalid credentials'}) 
        }
        generateTokenAndSetCookie(res, user._id)

        user.lastLogin = new Date()
        await user.save()

        return res.status(200).json({success: true, message: 'Logged in successfully', user: {
            ...user._doc, password: undefined
        }})
    } catch (error) {
        return res.status(400).json({success: false, message: error.message})
    }
}

export const logout = async (req, res)=> {
    res.clearCookie('token')
    res.status(200).json({success: true, message: 'Logged out successfully'})
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

export const forgotPassword = async (req, res)=> {
    const {email} = req.body

    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({status: false, message: 'Invalid credentials'})
        }

        const resetToken = crypto.randomBytes(20).toString('hex')
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        user.resetPasswordToken = resetToken
        user.resetPasswrodExpiresAt = resetTokenExpiresAt
        await user.save()

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`)
        res.status(200).json({success: true, message: 'Password reset link sent successfully'})

    } catch (error) {
        return res.status(400).json({success: false, message: error.message})
    }
}

export const resetPassword = async (req, res)=> {
    const {token} = req.params
    const {password} = req.body

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswrodExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({status: false, message: 'Invalid credentials'})
        }

        const hashedPassword = await bcryptjs.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswrodExpiresAt = undefined
        await user.save()

        await sendResetSuccessEmail(user.email)
        res.status(200).json({success: true, message: 'Password reset successfully'})

    } catch (error) {
        console.log(error);
        return res.status(400).json({success: false, message: error.message})
    }
}

export const checkAuth = async (req, res)=> {

    try {
        const user = await User.findById(req.userId).select('-password')

        if(!user){
            return res.status(400).json({status: false, message: 'User not found'})
        }

        return res.status(200).json({success: true, user})

    } catch (error) {
        console.log(error);
        return res.status(400).json({success: false, message: error.message})
    }
}