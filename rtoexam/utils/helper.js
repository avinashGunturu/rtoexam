const crypto = require('crypto');

const encryptData = (data, secretKey) => {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16); // Generate a random initialization vector

    const key = crypto.createHash('sha256') // Create a 32-byte key from the secretKey
        .update(secretKey)
        .digest();

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return the IV along with the encrypted data (IV is required for decryption)
    return {
        data: encrypted,
        iv: iv.toString('hex') // Return the IV in hex format
    };

};

module.exports = {
    encryptData
}