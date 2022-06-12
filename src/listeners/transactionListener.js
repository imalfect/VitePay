import {connPool,provider} from "../index.js";
import dotenv from "dotenv";
import vite from '@vite/vitejs'
import aes256 from 'aes256'
import {decodeB64, encodeB64} from "../utils/base64.js";
import {revertTransaction} from "../txUtils/revertTransaction.js";
import {sendToDestination} from "../txUtils/sendToDestination.js";
dotenv.config()


async function sendAccountBlock(accountBlock,privateKey) {
    accountBlock.setProvider(provider).setPrivateKey(privateKey);
    await accountBlock.autoSetPreviousAccountBlock();
    await accountBlock.PoW();
    const result = await accountBlock.sign().send();
    console.log('send success', result);
}

export async function transactionListener() {
    setInterval(async function() {
        const connection = await connPool.getConnection(() => {
            console.log('expiration')
        })

        const [rows] = await connection.execute(`SELECT * FROM transactions`)

        console.log(`Found ${rows.length} pending transactions!`)

        for (const transaction of rows) {
            if (transaction.txHash !== null) {
                const block = await provider.request(
                    "ledger_getAccountBlockByHash",
                    transaction.txHash
                ).catch((e) => {

                })
                if (block.confirmations > 15) {
                    const depositMnemo = aes256.decrypt(process.env.ENCRYPT_KEY,transaction.mmSeed)
                    // Receive

                    // Get Wallet

                    const txWallet = vite.wallet.getWallet(depositMnemo)

                    const derived = txWallet.deriveAddress(0)


                    const response = await sendToDestination(transaction.txHash,transaction.txAmount,transaction.txToken,transaction.txDestination,transaction.txID,derived)
                    if (response === 1) {
                        await connection.execute(`INSERT INTO expiredTransactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txID,txDestination,txStatus) VALUES ("${transaction.merchantName}","${transaction.txDescription}","${transaction.txToken}","${transaction.txAmount}","${transaction.mmSeed}","${transaction.mmAddress}","${transaction.txMemo}","${transaction.txID}","${transaction.txDestination}","1")`)
                        await connection.execute(`DELETE FROM transactions WHERE txID = '${transaction.txID}'`)
                        connection.destroy()
                        console.log(`Transaction ${transaction.txID} expired and is now deleted.`)
                    }
                } else {
                    console.log("Currently at ", block.confirmations, "still missing some")
                }
            }

            console.log(`Transaction id ${transaction.txID}, checking for unreceived deposits.`)
            const expectedAmount = transaction.txAmount
            const expectedMemo = transaction.txMemo
            const expectedTokenId = transaction.txToken
            const txDestination = transaction.txDestination
            const txID = transaction.txID
            const unreceived = await provider.request(
                "ledger_getUnreceivedBlocksByAddress",
                `${transaction.mmAddress}`,
                0,
                100
            )
            if (unreceived.length > 0) {
                console.log(`Transaction id ${transaction.txID}, has ${unreceived.length} unreceived deposits.`)
                for (const deposit of unreceived) {
                    const depositHash = deposit.hash
                    const depositAmount = deposit.amount
                    const depositMemo = decodeB64(deposit.data)
                    const depositTokenId = deposit.tokenId
                    const depositSource = deposit.fromAddress
                    const depositMnemo = aes256.decrypt(process.env.ENCRYPT_KEY,transaction.mmSeed)
                    // Receive

                    // Get Wallet

                    const txWallet = vite.wallet.getWallet(depositMnemo)

                    const derived = txWallet.deriveAddress(0)


                    const accountBlock = vite.accountBlock.createAccountBlock('receive', {
                        address:transaction.mmAddress,
                        sendBlockHash: depositHash
                    });

                    await sendAccountBlock(accountBlock,derived.privateKey).catch((e) => {
                        console.log("Issues with the block wooooo")

                    })

                    // Verify the Information

                    if (depositAmount === expectedAmount && depositMemo === expectedMemo && expectedTokenId === depositTokenId) {
                        // Nice!
                        console.log("wtf somehow it works but how i have no idea lmaoooo")
                        // Update
                        if (transaction.txHash === null) {
                            await connection.execute(`UPDATE transactions SET txHash = '${deposit.hash}', txDeadline = '999999999999' WHERE txID = '${transaction.txID}'`)

                        } else {
                            console.log(depositAmount)
                            console.log(expectedAmount)
                            console.log(depositMemo)
                            console.log(expectedMemo)
                            console.log(expectedTokenId)
                            console.log(depositTokenId)
                            await revertTransaction(depositHash,depositAmount,depositTokenId,depositSource,derived)
                            connection.destroy()
                            console.log("tx with correct already exists")
                        }





                    } else {
                        console.log(depositAmount)
                        console.log(expectedAmount)
                        console.log(depositMemo)
                        console.log(expectedMemo)
                        console.log(expectedTokenId)
                        console.log(depositTokenId)
                        await revertTransaction(depositHash,depositAmount,depositTokenId,depositSource,derived)
                        connection.destroy()
                        // Trigger refund or something idk
                    }
                }

            } else {
                console.log(`Transaction id ${transaction.txID}, has no unreceived deposits.`)
            }
        }



    },5000)
}
