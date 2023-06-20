const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const User = require("../schemas/UserSchema")
const nodemailer = require('nodemailer');
const uuid = require("uuid-random")
 
app.use(bodyParser.urlencoded({extended: false}))
 
router.get("/", (req, res, next) => {
    res.status(200).render("requestReset")
})
router.post("/", async (req, res, next) => {
 
    if(!req.body)
        return
    
    const payload = req.body
    const findEmail = req.body.resetEmail.trim()
 
    const getUser = await User.findOne({email: findEmail})
    .catch(() => {
        payload.statusMessage = "Something went wrong. Please try again."
        return res.status(400).render("requestReset", payload)
    })
 
    if(getUser == null) {
        payload.statusMessage = "No user found. Please use the email address you used when registering your account"
        return res.status(400).render("requestReset", payload)
    }
 
    else {
 
        const checkForField = await User.updateOne({email: findEmail}, [{$set:{"resetPassword": { $cond: [ { $not: ["$resetPassword"] }, "", "$resetPassword" ]}}}])
        .catch(() => {
            payload.statusMessage = "Something went wrong. Please try again."
            return res.status(400).render("requestReset", payload)
        })
 
        const checkForPreviousReset = await User.findOne({email: findEmail}).select("resetPassword")
        .catch(() => {
            payload.statusMessage = "Something went wrong. Please try again."
            return res.status(400).render("requestReset", payload)
        })
 
        if(checkForPreviousReset.resetPassword !== "") {
            payload.statusMessage = "You have already requested a password change. Please check your inbox"
            return res.status(400).render("requestReset", payload)
        }
 
        const uniqueId = uuid()
 
        const updateUser = await User.findOneAndUpdate({email: findEmail}, {resetPassword: uniqueId})
        .catch(() => {
            payload.statusMessage = "Something went wrong. Please try again."
            return res.status(400).render("requestReset", payload)
        })
 
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "1f82aea1db87a4",
              pass: "816e9e3b77d08c"
            }
          });
      
        var mailOptions = {
            from: 'Nayy App',
            to: findEmail,
            subject: 'Password change request',
            html: `You have requested a password change. 
            <p>Please follow this link to change your password:</p>
            <a href="http://localhost:3001/passwordReset?id=${uniqueId}">Click here</a>
            <br><br>If you don't see the link, please copy and paste this line in your browser's address bar:
            <p>http://localhost:3001/passwordReset?id=${uniqueId}</p>

            If you did not request this change, you might want to look into that.
            `
            
        }
      
        transport.sendMail(mailOptions, async function(error, info){
            if (error) {
                const updateUser = await User.findOneAndUpdate({email: findEmail}, {resetPassword: ""})
                .catch(() => {
                    payload.statusMessage = "Something went wrong. Please try again."
                    return res.status(400).render("requestReset", payload)
                })
                payload.statusMessage = "Something went wrong. Please try again"
                return res.status(400).render("requestReset", payload)
            } else {
            console.log('Email sent: ' + info.response)
            }
        })
 
        payload.statusMessage = "We have sent you an email with a link to reset your password. If you don't see it in your inbox, please check your spam folder"
        return res.status(200).render("requestReset", payload)
    }
})
 
module.exports = router