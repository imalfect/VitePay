import {connPool} from "../index.js";

import * as server from '../index.js'
import {provider} from "../index.js";
import {getTransactionConfirmations} from "../txUtils/getHashConfirmations.js";
// Returning {code:x,memo:y,mmAddress:z,amount:a,tokenId:b,txCode:c,expirationTime:d}:
/*
    Codes:
        1 - Success
        2 - ID doesn't exist
        500 - SQL Error
        600 - Vite Node issue
        502 - Other Issue
*/

export default server.router.post("/api/getTransaction", async function (req,res) {

    try {
        console.log(req.body)
        const transaction = await connPool.query(`SELECT * FROM transactions WHERE txID = ?`, [req.body.txID])

        if (transaction[0].length > 0) {
            // Transaction still pending
            const token = await provider.request(
                'mintage_getTokenInfoById',
                transaction[0][0].txToken
            )
            console.log(transaction[0][0].txHash)
            if (transaction[0][0].txHash !== null) {
                const txConfirmations = await getTransactionConfirmations(transaction[0][0].txHash)
                res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline,tokenSymbol:token.tokenSymbol,tokenDecimals:token.decimals,confirmations:txConfirmations,description:transaction[0][0].txDescription,merchantVerified:transaction[0][0].merchantVerified,merchantName:transaction[0][0].merchantName,css:transaction[0][0].css})
                return;
            }
            res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline,tokenSymbol:token.tokenSymbol,tokenDecimals:token.decimals,description:transaction[0][0].txDescription,merchantVerified:transaction[0][0].merchantVerified,merchantName:transaction[0][0].merchantName,css:transaction[0][0].css})
        } else {
            const expiredTransaction = await connPool.query(`SELECT * FROM expiredTransactions WHERE txID = ?`, [req.body.txID])

            if (expiredTransaction[0].length > 0) {

                // Transaction expired/completed
                if (parseInt(expiredTransaction[0][0].txStatus) === 3) {
                    res.json({code:1,txCode:parseInt(expiredTransaction[0][0].txStatus),redirectURL:expiredTransaction[0][0].redirectURL})
                } else {
                    res.json({code:1,txCode:parseInt(expiredTransaction[0][0].txStatus)})
                }

            } else {

                // No ID found


                res.json({code:2})
            }
        }
    } catch (e) {
        if (e.code === undefined || e.code.errno !== undefined) {
            // sql error
            throw {code:500}
        } else {
            throw e;
        }
    }

})
