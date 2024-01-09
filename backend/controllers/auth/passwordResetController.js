import asyncHandler from "express-async-handler";
import User from '../../models/useModel.js'
import VerificationToken from '../../models/verifyResetTokenModel.js'
import sendEmail from "../../utils/sendEmail.js";
const domainURL = process.env.DOMAIN;
const { randomBytes } = await import('crypto');

// $-title  Send password reset link
// $-path   POST /api/v1/auth/reset_password_request
// $-auth   Public

const resetPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body;
    if(!email){
        res.status(400)
        throw new Error('You must enter your email address')
    }

    const existingUser = await User.findOne({email}).select(
        "-passwordConfirm"
    );

    if(!existingUser){
        res.status(400)
        throw new Error("That emil is not associated with any account");
    }

    let verificationToken = await VerificationToken.findOne({_userId:existingUser._id});

    if(verificationToken){
        await verificationToken.deleteOne();
    }

    const resetToken = randomBytes(32).toString('hex');

    let newVerificationToken = await new VerificationToken({
        _userId : existingUser._id ,
        token : resetToken,
        createdAt: Date.now()
    }).save();

    if(existingUser && existingUser?.isEmailVerified){
        const emailLink = `${domainURL}/auth/reset_password?emailToken=${newVerificationToken.token}&userId=${existingUser._id}`;

        const payload = {
            name : existingUser.firstName,
            link : emailLink
        }

        await sendEmail(
            existingUser.email,
            'Resending Email Verification',
            payload,
            './emails/template/requestResetPassword.handlebars'
        );

        res.status(200);
        res.json({
            success: true,
            message:`Hi ${existingUser.firstName} a verification mail has been sent to your registered email address`,
        })
    }
});

// $-title  Reset User Password
// $-path   POST /api/v1/auth/reset_password
// $-auth   Public


const resetPassword = asyncHandler(async (req, res) => {
    const {password, passwordConfirm, userId, emailToken}= req.body;
    
    if(!password){
        res.status(400);
        throw new Error("Please provide a valid password");
    }

    if(!passwordConfirm){
        res.status(400);
        throw new Error("Please provide a confirm password");
    }

    if(password !== passwordConfirm){
        res.status(400)
        throw new Error('The provided passwords do not match');
    }

    if(password.length < 8){
        res.status(400)
        throw new Error('Password must me at least 8 character long')
    };

    const passwordResetToken = await VerificationToken.findOne({_userId:userId});

    console.log(passwordResetToken);
    if(!passwordResetToken){
        res.status(400);
        throw new Error("Your token is either invalid or expired. Ty resetting your password again");
    }

    const user = await User.findOne({
        _id: passwordResetToken._userId
    }).select("-passwordConfirm");

    if(user && passwordResetToken){
        user.password = password;
        await user.save();

        const payload = {
            name: user.firstName,
        }
        
        await sendEmail(
            user.email,
            'Password Reset Success',
            payload,
            './emails/template/resetPassword.handlebars'

        )

        res.json({
            status: true,
            message:"Password has been successfully changed",
        })
    }
});


export {resetPassword, resetPasswordRequest};

