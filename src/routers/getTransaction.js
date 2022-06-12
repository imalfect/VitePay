import {connPool} from "../index.js";

import * as server from '../index.js'
// Returning {code:x,memo:y,mmAddress:z,amount:a,tokenId:b,txCode:c,expirationTime:d}:
/*
    Codes:
        1 - Success
        2 - ID doesn't exist
        400 - SQL Error
        502 - Other Issue
*/

export default server.router.get("/api/getTransaction", async function (req,res) {

    try {
        const connection = await connPool.getConnection()

        const transaction = await connection.execute(`SELECT * FROM transactions WHERE txID = '${encodeURIComponent(req.body.txID)}'`)

        if (transaction[0].length > 0) {
            // Transaction still pending
            connection.destroy()
            res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline})
        } else {
            const expiredTransaction = await connection.execute(`SELECT * FROM transactions WHERE txID = '${encodeURIComponent(req.body.txID)}'`)

            if (expiredTransaction[0].length > 0) {

                // Transaction expired
                connection.destroy()

                res.json({code:1,txCode:expiredTransaction.txStatus})
            } else {

                // No ID found

                connection.destroy()

                res.json({code:2})
            }
        }
    } catch (e) {
        res.json({code:502})
    }

})
