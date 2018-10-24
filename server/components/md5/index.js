const crypto = require('crypto');

function md5(str, algo) {
    const cryptoHash = crypto.createHash(algo || 'md5');
    cryptoHash.update(str);
    return cryptoHash.digest('hex');
}

module.exports = md5;