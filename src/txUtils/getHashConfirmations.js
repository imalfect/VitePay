import {provider} from "../index.js";

export async function getTransactionConfirmations(hash) {

    try {
        const block = await provider.request(
            "ledger_getAccountBlockByHash",
            hash
        )
        return block.confirmations
    } catch (e) {
        throw {code:600}
    }

}