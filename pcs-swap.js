require("dotenv").config()
const ethers = require('ethers')
const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = 
require('@pancakeswap-libs/sdk');
const Web3 = require('web3');
const web3 = new Web3('wss://apis.ankr.com/wss/c40792ffe3514537be9fb4109b32d257/946dd909d324e5a6caa2b72ba75c5799/binance/full/main');
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed1.binance.org/');
const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)

const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    PANCAKE_ROUTER: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'
}

const ONE_ETH_IN_WEI = web3.utils.toBN(web3.utils.toWei('1'))
const tradeAmount = ONE_ETH_IN_WEI.div(web3.utils.toBN('1000'))

const init = async () => {

const [WBNB, BUSD] = await Promise.all(
    [addresses.WBNB, addresses.BUSD].map(tokenAddress => (
        new Token(
            ChainId.MAINNET,
            tokenAddress,
            18
        )
    )));

const pair = await Fetcher.fetchPairData(WBNB, BUSD, provider)
const route = await new Route([pair], WBNB)
const trade = await new Trade(route, new TokenAmount(WBNB, tradeAmount), TradeType.EXACT_INPUT)

const slippageTolerance = new Percent('50', '10000')

// create transaction parameters
const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw
const path = [WBNB.address, BUSD.address]
const to = admin
const deadline = Math.floor(Date.now() / 1000) + 60 * 20

// Create signer
const wallet = new ethers.Wallet(
    Buffer.from(
    process.env.PRIVATE_KEY, // paste your private key from metamask here
    "hex"
    )
)
const signer = wallet.connect(provider)

// Create Pancakeswap ethers Contract
const pancakeswap = new ethers.Contract(
    addresses.PANCAKE_ROUTER,
    ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],
    signer
)

// Allow Pancakeswap
// let abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"]
// let contract = new ethers.Contract(WBNB.address, abi, signer)
// await contract.approve(addresses.PANCAKE_ROUTER, ethers.utils.parseUnits('1000.0', 18), {gasLimit: 100000, gasPrice: 5e9})

// Execute transaction
const tx = await pancakeswap.swapExactTokensForTokens(
    ethers.utils.parseUnits('0.001', 18),
    ethers.utils.parseUnits(web3.utils.fromWei(amountOutMin.toString()), 18),
    path,
    to,
    deadline,
    { gasLimit: ethers.utils.hexlify(200000), gasPrice: ethers.utils.parseUnits("10", "gwei") }
)

console.log(`Tx-hash: ${tx.hash}`)

const receipt = await tx.wait();

console.log(`Tx was mined in block: ${receipt.blockNumber}`)
}

init()