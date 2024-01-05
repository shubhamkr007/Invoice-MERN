import asyncHandler from "express-async-handler";
import User from '../../models/useModel.js'
import VerificationToken from '../../models/verifyResetTokenModel.js'
import sendEmail from "../../utils/sendEmail.js"

const domainURL = process.env.DOMAIN;

// $-title  Verify User Email
// $-path   GET /api/v1/verify/:emailToken/:userId
// $-auth   Public

const verifyUserEmail = asyncHandler(async (req,res)=>{
    const user = await User.findOne({_id:req.params.userId})
    .select("-passwordConfirm");

    if(!user){
        res.status(400);
        throw new Error('We where unable to find a user for this token')
    }

    if(user.isEmailVerified){
        res.status(400);
        throw new Error('This email is already verified. Please Login');
    }

    const userToken = await VerificationToken.findOne({
        _userId: user._id,
        token: req.params.emailToken,
    })

    if(!userToken){
        res.status(400)
        throw new Error('The Token is invalid or has expired');
    }

    user.isEmailVerified = true;
    await user.save();

    if(user.isEmailVerified){
        const emailLink = `${domainURL}/login`
        const payload = {
            name: user.firstName,
            link: emailLink
        }

        await sendEmail(
            user.email,
            "Welcome - Account Verified",
            payload,
            "./emails/template/welcome.handlebars"
        );

        res.redirect("/auth/verify");
    }

}) 

export default verifyUserEmail;