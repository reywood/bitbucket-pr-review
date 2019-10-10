async function sha1(message) { // eslint-disable-line no-unused-vars
    const msgBuffer = new TextEncoder('utf-8').encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => (`00${b.toString(16)}`).slice(-2)).join('');
    return hashHex;
}
