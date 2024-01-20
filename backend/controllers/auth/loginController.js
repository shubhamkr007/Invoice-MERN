import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from '../../models/useModel.js'
import { systemLogs } from '../../utils/Logger.js'

// $-title  Login User and get access and refresh token
// $-path   POST /api/v1/login
// $-auth   Public

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
        res.status(400)
        throw new Error("Please an Enter an email and password")
    }

    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser || !(await existingUser.comparePassword(password))) {
        res.status(401)
        systemLogs.error("Incorrect email or password")
        throw new Error("Incorrect email or password")
    }

    if (!existingUser.isEmailVerified) {
        res.status(400)
        throw new Error("You are not verified. Check your email, a new email was sent")
    }

    if (!existingUser.active) {
        res.status(400);
        throw new Error("Your have been deactivated by the admin, contact the admin")
    }

    if (existingUser && (await existingUser.comparePassword(password))) {
        // Generate Access Token
        const accessToken = jwt.sign({
            id: existingUser._id,
            role: existingUser.roles,
        },
            process.env.JWT_ACCESS_SECRET_KEY,
            { expiresIn: "1h" }
        );

        const newRefreshToken = jwt.sign({
            id: existingUser._id,
        },
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        );

        const cookies = req.cookies;

        let newRefreshTokenArray = !cookies?.jwt ?
            existingUser.refreshToken :
            existingUser.refreshToken.filter((refT) => refT !== cookies.jwt);

        if (cookies?.jwt) {
            const refreshToken = cookies.jwt
            const existingRefreshToken = await User.findOne({ refreshToken }).exec()

            if (!existingRefreshToken) {
                newRefreshTokenArray = [];
            }

            const options = {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'None',
                secure: true
            }

            res.clearCookie("jwt", options);
        }

        existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await existingUser.save();

        const options = {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'None',
            secure: true
        };

        res.cookie("jwt", newRefreshToken, options);

        res.json({
            success: true,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            username: existingUser.username,
            provider: existingUser.provider,
            avatar: existingUser.avatar,
            accessToken
        });
    } else {
        res.status(401)
        throw new Error("Invalid credentials provided")
    }
})

export default loginUser; 