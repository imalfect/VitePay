import {connPool} from "../index.js";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'
import moment from "moment";
import {provider} from "../index.js";
import aes256 from 'aes256'
import vite from "@vite/vitejs"
dotenv.config()

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";

    // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url yes lol
}



export async function createNewTransaction(merchantName,description,tokenId,amount,memoprefix,txDestination,merchantVerified,redirectURL) {


    try {


        if (memoprefix === null) {
            memoprefix = ''
        }

        // Thousands of checks
        // Check memoprefix length
        if (memoprefix.length > 8) {
            throw {code:2,id:undefined,expires:undefined}
        }
        // Check if token is valid

        if (!vite.utils.isValidTokenId(tokenId)) {
            throw {code:3,id:undefined,expires:undefined}
        }

        // Check if the destination address is valid

        const addressValidationInfo = vite.wallet.isValidAddress(txDestination)

        if (addressValidationInfo === 0 || addressValidationInfo === 2) {
            throw {code:4,id:undefined,expires:undefined}
        }

        // Check if the amount is a number

        if (isNaN(amount)) {
            throw {code:5,id:undefined,expires:undefined}
        }

        // Check description length

        if (description.length > 75) {
            throw {code:6,id:undefined,expires:undefined}
        }

        // Check if the URL is valid

        if (!isValidHttpUrl(redirectURL)) {
            throw {code:7,id:undefined,expires:undefined}
        }



        // Checks are finished





        const connection = await connPool.getConnection()

        // Generate ID and Memo
        const txId = randomstring.generate({
            length:8,
            charset:'numeric'
        })
        const txMemo = memoprefix + txId
        const expirationTime = moment().add(15,'minutes').unix()

        const mmMnemonicsUnencrypted = vite.wallet.createMnemonics()
        const mmMnemonics = aes256.encrypt(process.env.ENCRYPT_KEY,mmMnemonicsUnencrypted)
        const mmAddress = vite.wallet.deriveAddress({
            mnemonics:mmMnemonicsUnencrypted,
            index:0
        }).address
        // Insert into DB

        await connection.execute(`INSERT INTO transactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txDeadline,txID,txDestination,merchantVerified,redirectURL) VALUES ("${merchantName}", "${encodeURIComponent(description)}", "${tokenId}", "${amount}","${mmMnemonics}","${mmAddress}","${txMemo}", "${expirationTime}", "${txId}", "${txDestination}", "${merchantVerified}","${redirectURL}")`)

        return {code:1,id:txId,expires:expirationTime,url:`${process.env.WEB_URL}/pay/${txId}`}
    } catch (e) {
        if (e.code.errno !== undefined) {
            // sql error
            throw {code:500}
        } else {
            throw e;
        }
    }

}
