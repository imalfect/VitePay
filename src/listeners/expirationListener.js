// Import
import {connPool} from "../index.js";
import moment from 'moment'

export async function expirationListener() {
    setInterval(async function() {
        console.log("expirationListener: Looking for expired transactions")
        try {
            const connection = await connPool.getConnection(function(){
                console.log("expirationListener: MySQL Connected!")
            })
            const expiredTime = moment().unix() // Transactions above this are expired
            const txList = await connection.query(`SELECT * from transactions`)

            for (const transaction of txList[0]) {
                // Loop through each transaction
                if (parseInt(transaction.txDeadline) > expiredTime) {
                    // Delete and insert into expired.
                    await connection.execute(`INSERT INTO expiredTransactions (txMemo,txID) VALUES ("${transaction.txMemo}","${transaction.txID}")`)
                    await connection.execute(`DELETE FROM transactions WHERE txID = '${transaction.txID}'`)
                    console.log(`Transaction ${transaction.txID} expired and is now deleted.`)


                }
            }
        } catch (e) {
            // Add proper error handling
        }

    } ,15000)




}