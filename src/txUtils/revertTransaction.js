import ViteJS from '@vite/vitejs'
import {provider} from "../index.js";

async function getHeight() {
    return await provider.request('ledger_getSnapshotChainHeight')
}
async function sendAccountBlock(accountBlock,privateKey) {
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
       const result = await accountBlock.sign().send().catch((e) => {
           console.warn(e)
       })
       console.log('send success', result);
   }
}
export async function revertTransaction(hash,txAmount,tokenId,destination,derived) {
    const block = await provider.request(
        'ledger_getBlockByHash',
        `${hash}`
    )
    if (block.amount === txAmount && block.tokenId === tokenId && block.fromAddress === destination) {
        // Continue
        try {
            const accountBlock = ViteJS.accountBlock.createAccountBlock('send', {
                address: derived.address,
                toAddress: destination,
                tokenId: tokenId,
                amount: txAmount    // 10 Vite (18 decimals)
            }, provider, derived.privateKey);
    await sendAccountBlock(accountBlock,derived.privateKey)


        } catch (e) {
            console.warn(e)
        }

    } else {
        console.log(block.amount)
        console.log(txAmount)
        console.log(block.tokenId)
        console.log(tokenId)
        console.log(block.fromAddress)
        console.log(destination)
        console.log("Somethings not right lmaoooooo")
    }
}
