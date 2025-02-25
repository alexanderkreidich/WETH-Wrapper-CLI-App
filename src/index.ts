import abi from "./abi.json";
import { createPublicClient, http, RpcError, type Address } from "viem";
import { mainnet } from "viem/chains";
import BigNumber from "bignumber.js";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL: string = process.env.RPC_URL!;

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL)
});

export async function withdrawWETH() {
  try {
    const totalSupply = await publicClient.readContract({
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      abi: abi,
      functionName: 'totalSupply',
      args: []
    }) as bigint;

    const decimals = await publicClient.readContract({
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      abi: abi,
      functionName: 'decimals',
      args: []
    }) as bigint;

    const balanceOf = await publicClient.readContract({
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      abi: abi,
      functionName: 'balanceOf',
      args: []
    }) as bigint;

    // Convert values to BigNumber
    const totalSupplyBN = new BigNumber(totalSupply.toString());
    // Calculate multiplier as 10^decimals
    const multiplier = new BigNumber(10).exponentiatedBy(Number(decimals));
    // Divide the total supply by the multiplier to obtain a human-readable format
    const humanReadableSupply = totalSupplyBN.dividedBy(multiplier);

    return humanReadableSupply;
  } catch (error) {
    if (error instanceof RpcError) {
      console.error("Error calling contract for withdrawWETH:", error.message);
    } else {
      console.error("Unexpected error in withdrawWETH:", error);
    }
    return null;
  }
}

export async function checkBalance(address: string) {
  // Validate the address using a regular expression
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.error("Invalid address. Ensure the address starts with 0x and contains 40 hexadecimal characters.");
    return null;
  }

  // WETH contract address (make sure the address is checksummed correctly)
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  try {
    // Get the raw balance for the specified account
    const balanceRaw = await publicClient.readContract({
      address: wethAddress,
      abi: abi,
      functionName: "balanceOf",
      args: [address]
    }) as bigint;

    // Get the number of decimals for the WETH contract
    const decimalsRaw = await publicClient.readContract({
      address: wethAddress,
      abi: abi,
      functionName: "decimals",
      args: []
    });

    // Convert the raw values to BigNumber for accurate arithmetic
    const balanceBN = new BigNumber(balanceRaw.toString());
    const multiplier = new BigNumber(10).exponentiatedBy(Number(decimalsRaw));

    // Convert the balance into a human-readable format by dividing by 10^decimals
    const humanReadableBalance = balanceBN.dividedBy(multiplier);

    console.log(`WETH balance for address ${address}: ${humanReadableBalance.toString()}`);
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
