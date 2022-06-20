import {connPool} from "../index.js";

import * as server from '../index.js'
import {provider} from "../../vitelab.js";
import {getTransactionConfirmations} from "../txUtils/getHashConfirmations.js";
// Returning {code:x,memo:y,mmAddress:z,amount:a,tokenId:b,txCode:c,expirationTime:d}:
/*
    Codes:
        1 - Success
        2 - ID doesn't exist
        400 - SQL Error
        502 - Other Issue
*/

export default server.router.post("/api/getTransaction", async function (req,res) {

    try {
        console.log(req.body)
        const connection = await connPool.getConnection()

        const transaction = await connection.execute(`SELECT * FROM transactions WHERE txID = '${encodeURIComponent(req.body.txID)}'`)

        if (transaction[0].length > 0) {
            // Transaction still pending
            connection.destroy()
            const token = await provider.request(
                'mintage_getTokenInfoById',
                transaction[0][0].txToken
            )
            console.log(transaction[0][0].txHash)
            if (transaction[0][0].txHash !== null) {
                const txConfirmations = await getTransactionConfirmations(transaction[0][0].txHash)
                res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline,tokenSymbol:token.tokenSymbol,tokenDecimals:token.decimals,confirmations:txConfirmations,description:transaction[0][0].txDescription,merchantVerified:transaction[0][0].merchantVerified,merchantName:transaction[0][0].merchantName})
                return;
            }
            res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline,tokenSymbol:token.tokenSymbol,tokenDecimals:token.decimals,description:transaction[0][0].txDescription,merchantVerified:transaction[0][0].merchantVerified,merchantName:transaction[0][0].merchantName})
        } else {
            const expiredTransaction = await connection.execute(`SELECT * FROM expiredTransactions WHERE txID = '${encodeURIComponent(req.body.txID)}'`)

            if (expiredTransaction[0].length > 0) {

                // Transaction expired/completed
                connection.destroy()
                if (parseInt(expiredTransaction[0][0].txStatus) === 3) {
                    res.json({code:1,txCode:parseInt(expiredTransaction[0][0].txStatus),redirectURL:expiredTransaction[0][0].redirectURL})
                } else {
                    res.json({code:1,txCode:parseInt(expiredTransaction[0][0].txStatus)})
                }

            } else {

                // No ID found

                connection.destroy()

                res.json({code:2})
            }
        }
    } catch (e) {
        res.json(e)
    }

})
