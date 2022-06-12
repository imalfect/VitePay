import * as server from '../index.js'
import {connPool} from '../index.js'
import dotenv from 'dotenv'
import {doesNameExist, createMerchant, getMerchantInfo} from "../dbTools/merchantTools.js";
import {createNewTransaction} from "../dbTools/createTransaction.js";

dotenv.config()
// Returning {code:x,key:y}:
/*
    Codes:
        1 - Success
        2 - Name already taken
        400 - SQL Error
        502 - Other Issue
*/


export default server.router.post("/api/createTransaction", async function (req,res) {
    try {
        const inputData = req.body
       const merchantInfo = await getMerchantInfo(req.body.key)

        if (merchantInfo.code === 1) {
            // Continue
            const x = await createNewTransaction(merchantInfo.name,req.body.description,req.body.tokenid,req.body.amount,req.body.memoprefix,req.body.destination,merchantInfo.verified)
            res.json(x)
        } else {
            // Name already exists
            res.json({code:2,key:undefined})
        }
    } catch (e) {
        console.log(e)
        res.json({code:e,key:undefined})
    }

})
