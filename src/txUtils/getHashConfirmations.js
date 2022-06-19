import {provider} from "../index.js";

export async function getTransactionConfirmations(hash) {
    const block = await provider.request(
        "ledger_getAccountBlockByHash",
        hash
    ).catch((e) => {

    })
    return block.confirmations
}