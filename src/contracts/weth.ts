import BigNumber from "bignumber.js";
import { stdin as input, stdout as output } from "process";
import { createInterface } from "readline";
import { RpcError } from "viem";
import wethAbi from "../abis/weth-abi.json";
import { publicClient, walletClient, } from "../client";
import { WETH_ADDRESS } from "../config";

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
    const depositAmountWeiStr = depositAmountBN
      .multipliedBy(weiMultiplier)
      .toFixed(0);
    const depositAmountWei = BigInt(depositAmountWeiStr);

    console.log(
      `Depositing ${answer} ETH (${depositAmountWeiStr} wei) to the WETH contract...`,
    );

    // Call the deposit() payable function with the provided ETH (value)
    const txHash = await walletClient.writeContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: "deposit",
      args: [],
      value: depositAmountWei,
    });

    console.log("Transaction sent. Transaction hash:", txHash);
  } catch (error) {
    console.error(
      "Error during ETH deposit:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function withdrawWETH() {
  try {
    // Create CLI interface for input
    const rl = createInterface({ input, output });
    const answer = await new Promise<string>((resolve) => {
      rl.question(
        "Enter the amount of WETH to withdraw (in ETH units): ",
        resolve,
      );
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
    const withdrawAmountWeiStr = withdrawAmountBN
      .multipliedBy(weiMultiplier)
      .toFixed(0);
    const withdrawAmountWei = BigInt(withdrawAmountWeiStr);

    console.log(
      `Withdrawing ${answer} WETH (${withdrawAmountWeiStr} wei) back to ETH...`,
    );

    // Call the withdraw(uint256) function to withdraw WETH
    const txHash = await walletClient.writeContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: "withdraw",
      args: [withdrawAmountWei],
    });

    console.log("Transaction sent. Transaction hash:", txHash);
  } catch (error) {
    console.error(
      "Error during WETH withdrawal:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function checkBalance(address: string) {
  // Validate the address using a regular expression
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.error(
      "Invalid address. Ensure the address starts with 0x and contains 40 hexadecimal characters.",
    );
    return null;
  }

  // WETH contract address (make sure the address is checksummed correctly)
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  try {
    // Get the raw balance for the specified account
    const balanceRaw = (await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: "balanceOf",
      args: [address],
    })) as bigint;

    // Get the number of decimals for the WETH contract
    const decimalsRaw = await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: "decimals",
      args: [],
    });

    // Convert the raw values to BigNumber for accurate arithmetic
    const balanceBN = new BigNumber(balanceRaw.toString());
    const multiplier = new BigNumber(10).exponentiatedBy(Number(decimalsRaw));

    // Convert the balance into a human-readable format by dividing by 10^decimals
    const humanReadableBalance = balanceBN.dividedBy(multiplier);

    console.log(
      `WETH balance for address ${address}: ${humanReadableBalance.toString()}`,
    );
    return humanReadableBalance;
  } catch (error) {
    if (error instanceof RpcError) {
      console.error("Error calling contract for balance check:", error.message);
    } else {
      console.error("Unexpected error in checkBalance:", error);
    }
    return null;
  }
}

