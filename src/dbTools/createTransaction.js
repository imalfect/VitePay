import {connPool} from "../index.js";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'
import moment from "moment";
import {provider} from "../index.js";
import aes256 from 'aes256'
import {utils, wallet} from '@vite/vitejs'
export async function createNewTransaction(merchantName,description,tokenId,amount,memoprefix,destination) {
    /*
    Returns {code:x,id:y,expires:z}
        Codes:
         1 => Success
         2 => memoPrefix too long (if any) max. 8 chars
         3 => Incorrect tokenId
         4 => Incorrect Destination Address
         5 => Amount NaN
         6 => Description too long (max. 75 chars)

    */
    if (memoprefix === null) {
        memoprefix = ''
    }

    // Thousands of checks
    // Check memoprefix length
    if (memoprefix.length > 8) {
        throw {code:2,id:undefined,expires:undefined}
    }
    // Check if token is valid

    if (!utils.isValidTokenId(tokenId)) {
        throw {code:3,id:undefined,expires:undefined}
    }

    // Check if the destination address is valid

    const addressValidationInfo = wallet.isValidAddress(destination)

    if (addressValidationInfo === 0 || addressValidationInfo === 2) {
        throw {code:4,id:undefined,expires:undefined}
    }

    // Check if the amount is a number

    if (isNaN(amount)) {
        throw {code:5,id:undefined,expires:undefined}
    }

    // Check description length

    if (destination.length > 75) {
        throw {code:6,id:undefined,expires:undefined}
    }


    // Checks are finished





    const connection = await connPool.getConnection()

    // Generate ID and Memo
    const txId = randomstring.generate({
        length:9,
        charset:'numeric'
    })
    const txMemo = memoprefix + randomstring.generate({
        length:7,
        charset:'numeric'
    })
    const expirationTime = moment().add(15,'minutes').unix()

    const mmMnemonicsUnencrypted = wallet.createMnemonics()
    const mmMnemonics = aes256.encrypt(process.env.ENCRYPT_KEY,mmMnemonicsUnencrypted)
    const mmAddress = wallet.deriveAddress({
        mnemonics:mmMnemonicsUnencrypted,
        index:0
    })

    // Insert into DB

    await connection.execute(`INSERT INTO transactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txDeadline,txID,txDestination) VALUES ('${encodeURIComponent(merchantName)}', '${encodeURIComponent(description)}', '${tokenId}', '${amount}','${mmMnemonics}','${mmAddress}','${txMemo}', '${expirationTime}', '${txId}', '${txDestination}')`)

    return {code:1,id:txId,expires:expirationTime}
}