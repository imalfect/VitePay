import crypto from 'crypto'

export async function sha256(message) {
    // encode as UTF-8aw
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    return crypto.createHash('sha256').update(msgBuffer).digest('hex');
}