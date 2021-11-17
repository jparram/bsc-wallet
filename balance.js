require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const {
  ChainId,
  Token,
  TokenAmount,
  Fetcher,
  Pair,
  Route,
  Trade,
  TradeType,
  Percent,
} = require("@pancakeswap-libs/sdk");
const Web3 = require("web3");
const web3 = new Web3(
  "wss://apis.ankr.com/wss/c40792ffe3514537be9fb4109b32d257/946dd909d324e5a6caa2b72ba75c5799/binance/full/main"
);
const { JsonRpcProvider } = require("@ethersproject/providers");
const PRIVATE_KEY = process.env.PRIVATEKEY;
const provider = new JsonRpcProvider("https://bsc-dataseed1.binance.org/");
const { address: admin } = web3.eth.accounts.wallet.add(PRIVATE_KEY);

const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    BUSD: '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3',
    PANCAKE_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E'
}

const ONE_ETH_IN_WEI = web3.utils.toBN(web3.utils.toWei('1'))
const tradeAmount = ONE_ETH_IN_WEI.div(web3.utils.toBN('1000'))

const init = async () => {
  // Create signer
  const wallet = new ethers.Wallet(
    PRIVATE_KEY // paste your private key from metamask here
  );

  const signer = wallet.connect(provider);
  const balance = await provider.getBalance(wallet.address);


  const [WBNB, BUSD] = await Promise.all(
    [addresses.WBNB, addresses.BUSD].map(
      (tokenAddress) => new Token(ChainId.MAINNET, tokenAddress, 18)
    )
  );

  const pair = await Fetcher.fetchPairData(WBNB, BUSD, provider);
  const route = await new Route([pair], WBNB);
  const trade = await new Trade(
    route,
    new TokenAmount(WBNB, tradeAmount),
    TradeType.EXACT_INPUT
  );

};

init().then().catch(console.log);
