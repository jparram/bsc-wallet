const Web3 = require('web3');
const bip = require('bip39');

const web3 = new Web3('https://bsc-dataseed1.binance.org:443');

async function main() {

    const mneomonic = bip.generateMnemonic();
    const seed = await bip.mnemonicToSeed(mneomonic);
    
    let account = web3.eth.accounts.create(seed);

    let wallet = web3.eth.accounts.wallet.add(account);

    console.log({
        mneomonic,
        seed,
        wallet
    })
}

main().then();