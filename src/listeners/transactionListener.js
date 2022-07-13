import {connPool,provider} from "../index.js";
import dotenv from "dotenv";
import vite from '@vite/vitejs'
import aes256 from 'aes256'
import {decodeB64,} from "../utils/base64.js";
import {revertTransaction} from "../txUtils/revertTransaction.js";
import {sendToDestination} from "../txUtils/sendToDestination.js";
import chalk from 'chalk'
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

        const [rows] = await connPool.query(`SELECT * FROM transactions`)

        console.log(chalk.yellow(`Found ${rows.length} pending transactions!`))

        for (const transaction of rows) {
            if (transaction.txHash !== null) {
                const block = await provider.request(
                    "ledger_getAccountBlockByHash",
                    transaction.txHash
                ).catch((e) => {

                })
                if (block.confirmations > 60) {
                    const depositMnemo = aes256.decrypt(process.env.ENCRYPT_KEY,transaction.mmSeed)
                    // Receive

                    // Get Wallet

                    const txWallet = vite.wallet.getWallet(depositMnemo)

                    const derived = txWallet.deriveAddress(0)


                    const response = await sendToDestination(transaction.txHash,transaction.txAmount,transaction.txToken,transaction.txDestination,transaction.txID,derived)
                    if (response === 1) {
                        await connPool.query(`INSERT INTO expiredTransactions (merchantName,txDescription,txToken,txAmount,mmSeed,mmAddress,txMemo,txID,txDestination,txStatus,redirectURL) VALUES ("${transaction.merchantName}","${transaction.txDescription}","${transaction.txToken}","${transaction.txAmount}","${transaction.mmSeed}","${transaction.mmAddress}","${transaction.txMemo}","${transaction.txID}","${transaction.txDestination}","3","${transaction.redirectURL}")`)
                        await connPool.query(`DELETE FROM transactions WHERE txID = '${transaction.txID}'`)
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
                        console.log("Issues with the block.")

                    })

                    // Verify the Information

                    if (depositAmount === expectedAmount && depositMemo === expectedMemo && expectedTokenId === depositTokenId) {
                        // Nice!
                        console.log("Nice!")
                        // Update
                        const tX = await connPool.query(`SELECT * FROM transactions WHERE txID = ?`, [transaction.txID])
                        if (tX[0][0].txHash === null) {
                            await connPool.query(`UPDATE transactions SET txHash = '${deposit.hash}', txDeadline = 'never' WHERE txID = '${transaction.txID}'`)

                        } else {
                            console.log(depositAmount)
                            console.log(expectedAmount)
                            console.log(depositMemo)
                            console.log(expectedMemo)
                            console.log(expectedTokenId)
                            console.log(depositTokenId)
                            await revertTransaction(depositHash,depositAmount,depositTokenId,depositSource,derived)
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
                        // Trigger refund or something idk
                    }
                }

            } else {
                console.log(`Transaction id ${transaction.txID}, has no unreceived deposits.`)
            }
        }



    },5000)
}
