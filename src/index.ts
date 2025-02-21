import abi from "./abi.json"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'


require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;

const RPC_URL = process.env.RPC_URL;

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL)
})


const totalSupply = await publicClient.readContract({
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  abi: abi,
  functionName: 'totalSupply',
  args: []
})

const decimals = await publicClient.readContract({
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  abi: abi,
  functionName: 'decimals',
  args: []
})



