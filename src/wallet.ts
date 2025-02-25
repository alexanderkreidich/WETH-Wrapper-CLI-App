import dotenv from "dotenv";
import abi from "./abi.json";
import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import BigNumber from "bignumber.js";
import { createInterface } from "readline";
import { stdin as input, stdout as output } from "process";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Validate PRIVATE_KEY: it must start with "0x" and contain 64 hexadecimal characters
if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.error(
    "Error: Invalid PRIVATE_KEY. Expected a hex string starting with '0x' and containing 64 hexadecimal characters."
  );
  process.exit(1);
}

// Create account object from the private key
const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(RPC_URL),
  account,
});

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export async function deposit() {
  try {
    // Create CLI interface for input
    const rl = createInterface({ input, output });
    const answer = await new Promise<string>((resolve) => {
      rl.question("Enter the amount of ETH to deposit: ", resolve);
    });
    rl.close();

    // Validate user input
    const depositValue = Number(answer);
    if (isNaN(depositValue) || depositValue <= 0) {
      console.error("Invalid input. The amount must be a positive number.");
      return;
    }

    // Convert the entered amount to a BigNumber
    const depositAmountBN = new BigNumber(answer);
    // Convert ETH to wei (using 18 decimal places)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18);
    const depositAmountWeiStr = depositAmountBN.multipliedBy(weiMultiplier).toFixed(0);
    const depositAmountWei = BigInt(depositAmountWeiStr);

    console.log(`Depositing ${answer} ETH (${depositAmountWeiStr} wei) to the WETH contract...`);

    // Call the deposit() payable function with the provided ETH (value)
    const txHash = await walletClient.writeContract({
      address: wethAddress,
      abi: abi,
      functionName: "deposit",
      args: [],
      value: depositAmountWei,
    });

    console.log("Transaction sent. Transaction hash:", txHash);
  } catch (error) {
    console.error("Error during ETH deposit:", error instanceof Error ? error.message : error);
  }
}

export async function withdrawWETH() {
  try {
    // Create CLI interface for input
    const rl = createInterface({ input, output });
    const answer = await new Promise<string>((resolve) => {
      rl.question("Enter the amount of WETH to withdraw (in ETH units): ", resolve);
    });
    rl.close();

    // Validate user input
    const withdrawValue = Number(answer);
    if (isNaN(withdrawValue) || withdrawValue <= 0) {
      console.error("Invalid input. The amount must be a positive number.");
      return;
    }

    // Convert the entered amount to a BigNumber
    const withdrawAmountBN = new BigNumber(answer);
    // Convert ETH to wei (using 18 decimal places)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18);
    const withdrawAmountWeiStr = withdrawAmountBN.multipliedBy(weiMultiplier).toFixed(0);
    const withdrawAmountWei = BigInt(withdrawAmountWeiStr);

    console.log(`Withdrawing ${answer} WETH (${withdrawAmountWeiStr} wei) back to ETH...`);

    // Call the withdraw(uint256) function to withdraw WETH
    const txHash = await walletClient.writeContract({
      address: wethAddress,
      abi: abi,
      functionName: "withdraw",
      args: [withdrawAmountWei],
    });

    console.log("Transaction sent. Transaction hash:", txHash);
  } catch (error) {
    console.error("Error during WETH withdrawal:", error instanceof Error ? error.message : error);
  }
}

// For testing, you can call one of the functions, e.g.:
// deposit().catch(console.error);
// withdrawWETH().catch(console.error);
