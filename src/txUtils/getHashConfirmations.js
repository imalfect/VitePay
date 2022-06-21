import {provider} from "../index.js";

export async function getTransactionConfirmations(hash) {

    try {
        const block = await provider.request(
            "ledger_getAccountBlockByHash",
            hash
        )
    } catch (e) {
        throw {code:600}
    }
    return block.confirmations
}