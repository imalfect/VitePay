import * as server from '../index.js'
import { resolve } from 'path';

export default server.router.get("/pay/*", async function (req,res) {
    res.sendFile(resolve('./src/public/views/pay.html'))
})
