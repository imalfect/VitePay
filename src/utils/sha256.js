export async function sha256(message) {
    // encode as UTF-8aw
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}