import * as server from '../index.js'
import dotenv from 'dotenv'
import {getMerchantInfo} from "../dbTools/merchantTools.js";
import {createNewTransaction} from "../dbTools/createTransaction.js";
import {app, payLimiter} from "../index.js";
import {functionResponse, resReply} from "../utils/responseConstructor.js";

dotenv.config()

/*
Returns {code:x,id:y,expires:z,url:a}
   Codes:
    1 => Success
    2 => memoPrefix too long (if any) max. 8 chars
    3 => Incorrect tokenId
    4 => Incorrect Destination Address
    5 => Amount NaN
    6 => Description too long (max. 75 chars)
    7 => Redirect URL invalid.
    8 => Merchant doesn't exist
   500 = > SQL Error
*/

app.use('/api/createTransaction', payLimiter)
export default server.router.post("/api/createTransaction", async function (req,res) {
    try {
       const merchantInfo = await getMerchantInfo(req.body.key)

        if (merchantInfo.code === 1) {
            // Continue
            const x = await createNewTransaction(merchantInfo.name,req.body.description,req.body.tokenid,req.body.amount,req.body.memoprefix,req.body.destination,merchantInfo.verified,req.body.redirecturl,merchantInfo.css)
            resReply(x,res)
        } else if (merchantInfo.code === 2) {
            // Merchant doesn't exist
            const issue = new functionResponse(400,{code:8,id:undefined,expires:undefined,url:undefined})
            resReply(issue,res)
        }
    } catch (e) {
        resReply(e,res)
    }

})
