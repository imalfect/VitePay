import {connPool} from "../index.js";
import dotenv from 'dotenv'
import * as randomstring from 'randomstring'
export async function doesNameExist(name) {
    try {
        const connection = await connPool.getConnection()

        const [rows] = await connection.query(`SELECT * FROM merchants WHERE name = '${encodeURIComponent(name)}'`)

        await connection.destroy()

        return rows.length > 0;
    } catch (e) {
        console.warn(e)
        throw Error('400');
    }
}



export async function createMerchant(name) {
    /*
    Returns:
    {code:x,key:x}
    1 - Success
    400 - SQL Error


    */
    try {
        const connection = await connPool.getConnection()

        const apiKey = randomstring.generate(parseInt(process.env.APIKEY_LENGTH))

        await connection.execute(`INSERT INTO merchants (name, apikey,verified) VALUES ('${name}', '${apiKey}', 'false')`)

        connection.destroy()

        return {code:1,key:apiKey}


    } catch (e) {
        console.warn(e)
        throw {code:400,key:null};
    }

}


export async function getMerchantInfo(key) {
    /*
Returns:
{code:x,name:y,verified:bool}
1 - Success
400 - SQL Error
500 - No merchant found

*/
try {
    const connection = await connPool.getConnection()

    const [rows] = await connection.execute(`SELECT * FROM merchants WHERE apikey = '${encodeURIComponent(key)}'`)
    connection.destroy()

    if (!rows.length > 0) {
        throw 500;
    } else {
        return {code:1,name:rows[0].name,verified:rows[0].verified}
    }
} catch (e) {
    console.log(e)
    throw 500;
}


}