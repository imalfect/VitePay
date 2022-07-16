import * as server from '../index.js'
import dotenv from 'dotenv'
import {doesNameExist,createMerchant} from "../dbTools/merchantTools.js";
import fetch from 'node-fetch'
import {app, payLimiter} from "../index.js";
import {resReply} from "../utils/responseConstructor.js";
dotenv.config()
// Returning {code:x,key:y}:
/*
    Codes:
        1 - Success
        2 - Name already taken
	3 - Captcha not completed
        400 - SQL Error
        502 - Other Issue
	503 - Captcha issue
*/



async function verifyCaptcha(key) {
try {  
	let stuff = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_KEY}&response=${key}`, { method: 'POST' }).then(res => res.json());
	return stuff.success
} catch (e) {
console.log(e)
throw 503
}
}




app.use('/api/createMerchant', payLimiter)
export default server.router.post("/api/createMerchant", async function (req,res) {
    try {
	const captcha = req.body.captchaResponse
	const verify = await verifyCaptcha(captcha)
	if (verify === true) {

        console.log(req.body)
        const name = encodeURIComponent(req.body.name)
        const doesMerchantExist = await doesNameExist(name)

        if (doesMerchantExist === false) {
            // Continue
            const x = await createMerchant(name)
            resReply(x,res)
        } else {

            // Name already exists
            res.status(200)
            res.json({code:2,key:undefined})
        }
} else {
        res.status(200)
        res.json({code:3,key:undefined})
return '';
}
    } catch (e) {
        console.log(e)
        res.status(500)
        res.json({code:e,key:undefined})
    }

})
