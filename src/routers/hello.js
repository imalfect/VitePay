import express from 'express'
import * as server from '../index.js'

export default server.router.get("/hello", async function (req,res) {
res.json("hello world!")
})
