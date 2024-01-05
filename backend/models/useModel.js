import  bcrypt from 'bcrypt'
import "dotenv/config"
import mongoose from 'mongoose'
import validator from 'validator'
import { USER } from '../constants/index.js'

const {Schema} = mongoose;

const userSchema = new Schema({
    email:{
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        validate:[validator.isEmail, "Please Provied a valid email"] 
    },
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate:{
            validator: function(value){
                return /^[A-z][A-z0-9-_]{3,23}$/.test(value);
            },
            message: "username must be alphanumeric, without any special characters. Hyphens and underscores allowed"
        }
    },
    firstName:{
        type: String,
        required: true,
        trim: true,
        validate:[
            validator.isAlphanumeric, "First Name can only have AlphaNumeric values, No special characters allowed"
        ]
    },
    lastName:{
        type: String,
        required: true,
        trim: true,
        validate:[
            validator.isAlphanumeric, "Last Name can only have AlphaNumeric values, No special characters allowed"
        ]
    },
    password: {
        type: String,
        select: false,
        validate:[
            validator.isStrongPassword, "Password must be atleast 8 characters long, with atleast 1 uppercase and lowercase and atleast 1 symbol"
        ]
    },
    passwordConfirm:{
        type:String,
        validate:{
            validator:function (val) {return val === this.password},
            message: "Password Do not match"
        },
    },
    isEmailVerified:{
        type:Boolean,
        required:true,
        default:false,
    },
    provider:{
        type:String,
        required:true,
        default: "email",
    },
    googleID: String,
    avatar: String,
    businessName: String,
    phoneNumber:{
        type:String,
        default: "+254123456789",
        validate:[
            validator.isMobilePhone,
            'Invalid Phone Number',
        ]
    },
    address: String,
    city: String,
    country: String,
    passwordChangedAt: Date,
    roles: {
        type: [String],
        default : [USER]
    },
    active:{
        type: Boolean,
        default: true,
    },
    refreshToken: [String],
},{
    timestamps: true,
});

userSchema.pre("save",async function(next){
    if(this.roles.length === 0){
        this.roles.push(USER)
        next()
    }
})
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save",async function(next){
    if(this.isModified("password") || this.isNew){
        return next();
    }

    this.passwordChangedAt = Date.now();
    next();
});

userSchema.methods.comparePassword = async function(givenPassword){
    return await bcrypt.compare(givenPassword, this.password)
}

const User = mongoose.model("User", userSchema);

export default User;

