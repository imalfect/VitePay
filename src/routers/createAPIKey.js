import * as server from '../index.js'
import {connPool} from '../index.js'
import dotenv from 'dotenv'
import {doesNameExist,createMerchant} from "../dbTools/merchantTools.js";

dotenv.config()
// Returning {code:x,key:y}:
/*
    Codes:
        1 - Success
        2 - Name already taken
        400 - SQL Error
        502 - Other Issue
*/


export default server.router.post("/api/createMerchant", async function (req,res) {
    try {
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
    } catch (e) {
        console.log(e)
        res.json({code:e,key:undefined})
    }

})
