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

        await connection.execute(`INSERT INTO merchants (name, apikey,verified) VALUES ('${encodeURIComponent(name)}', '${apiKey}', 'false')`)

        connection.destroy()

        return {code:1,key:apiKey}


    } catch (e) {
        console.warn(e)
        throw {code:400,key:null};
    }

}
