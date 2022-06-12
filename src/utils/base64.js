export function encodeB64(string) {
    // plain-text string
    const str = string;

// create a buffer
    const buff = Buffer.from(str, 'utf-8');

// decode buffer as Base64
    return buff.toString('base64')
}

export function decodeB64(string) {
    // Base64 encoded string
    const base64 = string;

// create a buffer
    const buff = Buffer.from(base64, 'base64');

// decode buffer as UTF-8
    return buff.toString('utf-8')
}