import rateLimit from "express-rate-limit";
import {systemLogs} from "../utils/Logger.js"

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message:{
        message: "Too may request from this IP address, please try again after 15 minutes"
    },
    handler:(req,res,next,options)=>{
        systemLogs.error(
            `Too many request: ${options.message.message}\t${req.method} \t ${req.url}\t ${req.header.origin}`
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false
})


export const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message:{
        message: "Too may login attempts from this IP address, please try again after 30 minutes"
    },
    handler:(req,res,next,options)=>{
        systemLogs.error(
            `Too many request: ${options.message.message}\t${req.method} \t ${req.url}\t ${req.header.origin}`
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false
})