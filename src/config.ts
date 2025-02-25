import dotenv from 'dotenv'
import type { Address } from 'viem/accounts'

dotenv.config()

// Global Constant Variables
const RPC_URL: string = process.env.RPC_URL as string

const PRIVATE_KEY: Address = process.env.PRIVATE_KEY as Address

const WETH_ADDRESS: Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const WETH_DECIMALS: number = 18

export { PRIVATE_KEY, RPC_URL, WETH_ADDRESS, WETH_DECIMALS }
