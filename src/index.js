// noinspection ES6CheckImport

// Imports
import express from 'express'
import bodyParser from "body-parser";
import ViteJS from '@vite/vitejs'
import ViteJSHTTP from '@vite/vitejs-http'
import mysql2 from 'mysql2/promise'
import { readdirSync } from 'fs'
import dotenv from 'dotenv'

const WS_service = new ViteJSHTTP.HTTP_RPC(process.env.NODE_URL);
export const provider = new ViteJS.ViteAPI(WS_service, () => {
    console.log("Connected");
});


export const app = express()

export const router = express.Router()
// dotenv
dotenv.config()
// Server setup
app.listen(process.env.SERVER_PORT, async function() {
    console.log(`HTTP API listening on port ${process.env.SERVER_PORT}`)
})
// Static views
app.use(express.static("./public"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Load routers
readdirSync("./src/routers")
    .filter(file => file.endsWith(".js"))
    .forEach(async file => {
        await import(`./routers/${file}`)
        console.log(`Setup: Router ${file} loaded`)
    })

app.use('/',router)

// MySQL Connection Pool Setup
export const connPool = mysql2.createPool({
    connectionLimit: 10000,
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements:true
})