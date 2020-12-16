const assert = require('assert');
const ethWallet = require('ethereumjs-wallet');
var EthUtil = require('ethereumjs-util');


describe('Simple Math Test', () => {
    it('should return 2', () => {
        assert.strictEqual(1 + 1, 2);
    });
    it('should return 9', () => {
        assert.strictEqual(3 * 3, 9);
    });
});

describe('Simple Math Test FAIL', () => {
    it('should return 2', () => {
        assert.strictEqual(1, 2);
    });
});


describe('Simple Math Test', () => {
    it('should return 2', () => {
        assert.equal(1 + 1, 2);
    });
    it('should return 9', () => {
        assert.equal(3 * 3, 9);
    });
});


describe('Ethereum Test', () => {

    it('wallet should be 0x89c24a88bad4abe0a4f5b2eb5a86db1fb323832c and length should be 42', () => {
        const walletAddress = '0x89c24a88bad4abe0a4f5b2eb5a86db1fb323832c';
        const privateKeyString = '0x61ce8b95ca5fd6f55cd97ac60817777bdf64f1670e903758ce53efc32c3dffeb';
        const privateKeyBuffer = EthUtil.toBuffer(privateKeyString);

        const wallet = ethWallet.fromPrivateKey(privateKeyBuffer);
        assert.equal(wallet.getAddressString(),walletAddress);
        assert.equal(wallet.getAddressString(),walletAddress);
    });

});