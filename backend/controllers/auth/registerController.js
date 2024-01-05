import asyncHandler from "express-async-handler";
import User from '../../models/useModel.js'
import VerificationToken from '../../models/verifyResetTokenModel.js'
import sendEmail from "../../utils/sendEmail.js"
// import { register } from "module";

const domainURL = process.env.DOMAIN;

const {randomBytes} = await import('crypto');

// $-title  Register User and send email varification link
// $-path   POST /api/v1/register
// $-auth   Public

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, firstName, lastName, password, passwordConfirm} = req.body;
    if(!email){
        res.status(400)
        throw new Error("An email address is required")
    }
    if(!username){
        res.status(400)
        throw new Error("An username is required")
    }
    if(!firstName && !lastName){
        res.status(400)
        throw new Error("firstName and LastName is required")
    }
    if(!password){
        res.status(400)
        throw new Error("Enter a password");
    }

    if(!passwordConfirm){
        res.status(400)
        throw new Error("Confirm Password Field is Required")
    }

    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400)
        throw new Error("User already exists")
    }

    const newUser = new User({
        email, username, firstName, lastName, password, passwordConfirm,
    })

    const registeredUser = await newUser.save();

    if(!registeredUser){
        res.status(400);
        throw new Error("User could not be registered");
    }

    if(registeredUser){
        const verificationToken = randomBytes(32).toString("hex");

        let emailVerificationToken = await new VerificationToken({
            _userId: registeredUser._id,
            token: verificationToken
        }).save();

        const emailLink =`${domainURL}/api/v1/auth/verify/${emailVerificationToken.token}/${registeredUser._id}`;

        const payload = {
            name : registeredUser.firstName,
            link : emailLink
        }

        await sendEmail(
            registeredUser.email,
            "Account Verification",
            payload,
            "./emails/template/accountVerification.handlebars"
        );

        //respond json
        res.status(201).json({
            success: true,
            message: `A new user ${registeredUser.firstName} has been registered !
            verification email is send to accoount. Please Verify with in 15 minutes.`
        })
    }
})

export default registerUser;