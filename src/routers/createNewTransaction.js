import * as server from '../index.js'
import {connPool} from '../index.js'
import dotenv from 'dotenv'
import {doesNameExist, createMerchant, getMerchantInfo} from "../dbTools/merchantTools.js";
import {createNewTransaction} from "../dbTools/createTransaction.js";

dotenv.config()

/*
Returns {code:x,id:y,expires:z}
   Codes:
    1 => Success
    2 => memoPrefix too long (if any) max. 8 chars
    3 => Incorrect tokenId
    4 => Incorrect Destination Address
    5 => Amount NaN
    6 => Description too long (max. 75 chars)
    7 => Redirect URL invalid.
   500 = > SQL Error
*/


export default server.router.post("/api/createTransaction", async function (req,res) {
    try {
        const inputData = req.body
       const merchantInfo = await getMerchantInfo(req.body.key)

        if (merchantInfo.code === 1) {
            // Continue
            const x = await createNewTransaction(merchantInfo.name,req.body.description,req.body.tokenid,req.body.amount,req.body.memoprefix,req.body.destination,merchantInfo.verified,req.body.redirecturl)
            res.json(x)
        } else {
            // Name already exists
            res.json({code:2,key:undefined})
        }
    } catch (e) {
        if (e.code !== 500) {

        }
        console.log(e)
        res.json({code:e,key:undefined})
    }

})
