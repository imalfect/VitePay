import * as server from '../index.js'
import {connPool} from '../index.js'
import dotenv from 'dotenv'
import {doesNameExist,createMerchant} from "../dbTools/merchantTools.js";
import fetch from 'node-fetch'
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
                res.json(await createMerchant(name))
        } else {
            // Name already exists
                res.json({code:2,key:undefined})
        }
} else {

res.json({code:3,key:undefined})
return;
}
    } catch (e) {
        console.log(e)
        res.json({code:e,key:undefined})
    }

})
