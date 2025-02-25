import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { PRIVATE_KEY, RPC_URL } from "./config";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(RPC_URL),
  account: privateKeyToAccount(PRIVATE_KEY),
});

export { publicClient, walletClient };
