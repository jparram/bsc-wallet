require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const { JsonRpcProvider } = require("@ethersproject/providers");
console.log(process.env.PRIVATEKEY);

const config = {
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  safemoon: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3",
  pancakeSwapRouter: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
  slippage: 12,
};

const provider = new JsonRpcProvider("https://bsc-dataseed1.binance.org/");

const wallet = new ethers.Wallet(process.env.PRIVATEKEY);
const account = wallet.connect(provider);

const pancakeswap = new ethers.Contract(
  config.pancakeSwapRouter,
  [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  ],
  account
);

const wbnb = new ethers.Contract(
  config.wbnb,
  ["function approve(address spender, uint amount) public returns(bool)"],
  account
);

const buyToken = async () => {
  try {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const tokenIn = config.wbnb;
    const tokenOut = config.safemoon;
    const amountIn = ethers.utils.parseUnits("0.001", "ether");

    const amounts = await pancakeswap.getAmountsOut(amountIn, [
      tokenIn,
      tokenOut,
    ]);
    const amountOutMin = amounts[1].sub(amounts[1].div(`${config.slippage}`));

    console.log(`
  Buying new token
  tokenIn: ${amountIn} ${tokenIn} (WBNB)
  tokenOut: ${amountOutMin} ${tokenOut}
      `);
    const tx = await pancakeswap.swapExactETHForTokens(
      amountOutMin,
      [tokenIn, tokenOut],
      account.address,
      deadline,
      {
        gasPrice: provider.getGasPrice(),
        gasLimit: 100000,
      }
    );

    const receipt = await tx.wait();
    console.log("buyToken receipt");
    console.log(receipt);
  } catch (error) {
    console.log(error);
  }
};

const approve = async () => {
  const valueToapprove = ethers.utils.parseUnits("0.01", "ether");
  const tx = await wbnb.approve(pancakeswap.address, valueToapprove, {
    gasPrice: provider.getGasPrice(),
    gasLimit: 100000,
  });
  console.log("Approving...");
  const receipt = await tx.wait();
  console.log("Approve receipt");
  console.log(receipt);
};

const main = async () => {
  const balance = await provider.getBalance(account.address);
  console.log(ethers.utils.formatEther(balance));
  await approve();
  await buyToken();
  process.exit();
};

main().then().catch(console.log);
