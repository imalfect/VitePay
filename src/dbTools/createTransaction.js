import {connPool} from "../index.js";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'
import moment from "moment";
import aes256 from 'aes256'
import vite from "@vite/vitejs"
import {functionResponse} from "../utils/responseConstructor.js";

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



export async function createNewTransaction(merchantName,description,tokenId,amount,memoprefix,txDestination,merchantVerified,redirectURL,css) {


    try {


        if (memoprefix === null) {
            memoprefix = ''
        }

        // Thousands of checks
        // Check memoprefix length
        if (memoprefix.length > 8) {
            throw new functionResponse(400,{code:2,id:undefined,expires:undefined})
        }
        // Check if token is valid

        if (!vite.utils.isValidTokenId(tokenId)) {
            throw new functionResponse(400,{code:3,id:undefined,expires:undefined})

        }

        // Check if the destination address is valid

        const addressValidationInfo = vite.wallet.isValidAddress(txDestination)

        if (addressValidationInfo === 0 || addressValidationInfo === 2) {
            throw new functionResponse(400,{code:4,id:undefined,expires:undefined})
        }

        // Check if the amount is a number

        if (isNaN(amount)) {
            throw new functionResponse(400,{code:5,id:undefined,expires:undefined})

        }

        // Check description length

        if (description.length > 75) {
            throw new functionResponse(400,{code:6,id:undefined,expires:undefined})
        }

        // Check if the URL is valid

        if (!isValidHttpUrl(redirectURL)) {
            throw new functionResponse(400,{code:7,id:undefined,expires:undefined})
        }



        // Checks are finished






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
        await connPool.query(`INSERT INTO transactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txDeadline,txID,txDestination,merchantVerified,redirectURL,css) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,[merchantName,description,tokenId,amount,mmMnemonics,mmAddress,txMemo,expirationTime,txId,txDestination,merchantVerified,redirectURL,css])
        return new functionResponse(200,{code:1,id:txId,expires:expirationTime,url:`${process.env.WEB_URL}/pay/${txId}`})
    } catch (e) {
        if (e.code === undefined || e.code.errno !== undefined) {
            // sql error
            throw new functionResponse(500,{code:500,id:undefined,expires:undefined})
        } else {
            throw new functionResponse(500,{code:e,id:undefined,expires:undefined});
        }
    }

}
