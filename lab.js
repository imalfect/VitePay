import mysql2 from "mysql2/promise";
import dotenv from 'dotenv'
dotenv.config()
const connPool = mysql2.createPool({
    connectionLimit: 10000,
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements:true
})
async function e() {
    const c = await connPool.getConnection()
    const [rows] = await c.execute(`select * from transactions`)
    console.log(rows[0].txHash)

}

e()