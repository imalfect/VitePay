import ViteJS from '@vite/vitejs'
import {provider} from "../index.js";
import {connPool} from "../index.js";

async function getHeight() {
    return await provider.request('ledger_getSnapshotChainHeight')
}
async function sendAccountBlock(accountBlock,privateKey) {
    try {
        // Wait until height changes
        const currentHeight = await getHeight()
        const heightInterval = setInterval(async function() {
            let nowHeight = await getHeight()
            if (nowHeight > currentHeight) {
                clearInterval(heightInterval)
                await sendBlock()

            } else {
                console.log('sendAccountBlock waiting for height change.')
            }
        },1000)
        async function sendBlock() {
            accountBlock.setProvider(provider).setPrivateKey(privateKey);
            await accountBlock.autoSetPreviousAccountBlock();
            await accountBlock.PoW();
            await accountBlock.sign().send().catch((e) => {
                console.warn(e)
            })
            return 1;
        }
    } catch (e) {
        console.warn(e)
    }

}
export async function sendToDestination(hash,txAmount,tokenId,destination,dbID,derived) {
    const block = await provider.request(
        'ledger_getBlockByHash',
        `${hash}`
    )
    const connection = await connPool.getConnection()
    console.log(dbID)
    const [rows] = await connection.execute(`SELECT * FROM transactions WHERE txID = '${dbID}'`)
    console.log(rows)
    connection.destroy()
    if (block.amount === txAmount && block.tokenId === tokenId && rows[0].txDestination === destination) {
        // Continue
        try {
            const accountBlock = ViteJS.accountBlock.createAccountBlock('send', {
                address: derived.address,
                toAddress: destination,
                tokenId: tokenId,
                amount: txAmount    // 10 Vite (18 decimals)
            }, provider, derived.privateKey);
            await sendAccountBlock(accountBlock,derived.privateKey)
            return 1;


        } catch (e) {
            console.warn(e)
        }

    } else {
        console.log(block.amount)
        console.log(txAmount)
        console.log(block.tokenId)
        console.log(tokenId)
        console.log(rows[0].txDestination)
        console.log(destination)
        console.log("Somethings not right lmaoooooo")
    }
}
