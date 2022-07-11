// Import
import {connPool} from "../index.js";
import moment from 'moment'

export async function expirationListener() {
    setInterval(async function() {
        //console.log("expirationListener: Looking for expired transactions")
        try {

            const currentTime = moment().unix() // Transactions above this are expired
            const txList = await connPool.query(`SELECT * from transactions`)

            for (const transaction of txList[0]) {
                // Loop through each transaction
                if (transaction.txDeadline !== 'never' && parseInt(transaction.txDeadline) < currentTime) {
                    // Delete and insert into expired.
                    await connPool.query(`INSERT INTO expiredTransactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txID,txDestination,txStatus) VALUES ("${transaction.merchantName}","${transaction.txDescription}","${transaction.txToken}","${transaction.txAmount}","${transaction.mmSeed}","${transaction.mmAddress}","${transaction.txMemo}","${transaction.txID}","${transaction.txDestination}","2")`)
                    await connPool.query(`DELETE FROM transactions WHERE txID = '${transaction.txID}'`)
                    console.log(`Transaction ${transaction.txID} expired and is now deleted.`)


                }
            }
        } catch (e) {
            console.warn(e)
            // Add proper error handling
        }

    } ,1500)




}
