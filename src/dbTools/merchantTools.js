import {connPool} from "../index.js";
import aes256 from "aes256";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'

dotenv.config()

export async function doesNameExist(name) {
    try {
        const connection = await connPool.getConnection()

        const [rows] = await connection.query(`SELECT * FROM merchants WHERE name = '${encodeURIComponent(name)}'`)

        await connection.destroy()

        return rows.length > 0;
    } catch (e) {
        if (e.code.errno !== undefined) {
            // sql error
            throw {code:500}
        } else {
            throw e;
        }
    }
}



export async function createMerchant(name) {
    /*
    Returns:
    {code:x,key:x}
    1 - Success
    500 - SQL Error


    */
    try {
        const connection = await connPool.getConnection()

        const apiKey = aes256.encrypt(process.env.ENCRYPT_KEY,randomstring.generate(parseInt(process.env.APIKEY_LENGTH)))

        await connection.execute(`INSERT INTO merchants (name, apikey,verified) VALUES ("${name}", "${apiKey}", "false")`)

        connection.destroy()

        return {code:1,key:aes256.decrypt(process.env.ENCRYPT_KEY,apiKey)}


    } catch (e) {
        if (e.code.errno !== undefined) {
            // sql error
            throw {code:500}
        } else {
            throw e;
        }
    }

}


export async function getMerchantInfo(key) {
    /*
Returns:
{code:x,name:y,verified:bool}
1 - Success
2 - No merchant found
500 - SQL Error


*/
try {
    const connection = await connPool.getConnection()

    const [rows] = await connection.execute(`SELECT * FROM merchants WHERE apikey = '${aes256.encrypt(process.env.ENCRYPT_KEY,key)}'`)
    connection.destroy()

    if (!rows.length > 0) {
        throw {code:8};
    } else {
        return {code:1,name:rows[0].name,verified:rows[0].verified}
    }
} catch (e) {
    if (e.code.errno !== undefined) {
        // sql error
        throw {code:500}
    } else {
        throw e;
    }
}


}