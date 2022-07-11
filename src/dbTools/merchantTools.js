import {connPool} from "../index.js";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'
import {sha256} from "../utils/sha256.js";

dotenv.config()

export async function doesNameExist(name) {
    try {

        const connection = await connPool.getConnection()

        const [rows] = await connection.query(`SELECT * FROM merchants WHERE name = '${encodeURIComponent(name)}'`)

        await connection.destroy()

        return rows.length > 0;
    } catch (e) {
        console.log(e)
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

        const apiKey = randomstring.generate(parseInt(process.env.APIKEY_LENGTH))
        const shaKey = await sha256(apiKey)
        console.log(shaKey)
        await connection.execute(`INSERT INTO merchants (name, apikey,verified) VALUES ("${name}", "${shaKey}", "false")`)

        connection.destroy()

        return {code:1,key:apiKey}


    } catch (e) {
        console.log(e)
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
{code:x,name:y,verified:bool,css:z}
1 - Success
2 - No merchant found
500 - SQL Error


*/
try {
    const connection = await connPool.getConnection()

    const [rows] = await connection.execute(`SELECT * FROM merchants WHERE apikey = '${await sha256(key)}'`)
    connection.destroy()

    if (!(rows.length > 0)) {
        throw {code:8};
    } else {
        return {code:1,name:rows[0].name,verified:rows[0].verified,css:rows[0].css}
    }
} catch (e) {
    if (e.code === undefined || e.code.errno !== undefined) {
        // sql error
        throw {code:500}
    } else {
        throw e;
    }
}


}