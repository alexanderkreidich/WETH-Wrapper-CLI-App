import BigNumber from 'bignumber.js'
import { RpcError, type Address } from 'viem'
import wethAbi from '../abis/weth-abi.json'
import { publicClient, walletClient } from '../client'
import { WETH_ADDRESS, WETH_DECIMALS } from '../config'

export async function deposit(ethAmount: number) {
  try {
    // Convert the entered amount to a BigNumber
    const depositAmountBN = new BigNumber(ethAmount)
    // Convert ETH to wei (using 18 decimal places)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18)
    const depositAmountWeiStr = depositAmountBN
      .multipliedBy(weiMultiplier)
      .toFixed(0)
    const depositAmountWei = BigInt(depositAmountWeiStr)

    console.log(
      `Depositing ${ethAmount} ETH (${depositAmountWeiStr} wei) to the WETH contract...`
    )

    // Call the deposit() payable function with the provided ETH (value)
    const txHash = await walletClient.writeContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: 'deposit',
      args: [],
      value: depositAmountWei,
    })

    console.log('Transaction sent. Transaction hash:', txHash)
  } catch (error) {
    console.error(
      'Error during ETH deposit:',
      error instanceof Error ? error.message : error
    )
  }
}

export async function withdraw(ethAmount: number) {
  try {
    // Convert the entered amount to a BigNumber
    const withdrawAmountBN = new BigNumber(ethAmount)
    // Convert ETH to wei (using 18 decimal places)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18)
    const withdrawAmountWeiStr = withdrawAmountBN
      .multipliedBy(weiMultiplier)
      .toFixed(0)
    const withdrawAmountWei = BigInt(withdrawAmountWeiStr)

    console.log(
      `Withdrawing ${ethAmount} WETH (${withdrawAmountWeiStr} wei) back to ETH...`
    )

    // Call the withdraw(uint256) function to withdraw WETH
    const txHash = await walletClient.writeContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: 'withdraw',
      args: [withdrawAmountWei],
    })

    console.log('Transaction sent. Transaction hash:', txHash)
  } catch (error) {
    console.error(
      'Error during WETH withdrawal:',
      error instanceof Error ? error.message : error
    )
  }
}

export async function balanceOf(address: Address) {
  try {
    // Get the raw balance for the specified account
    const balanceRaw = (await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: wethAbi,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint

    // Get the number of decimals for the WETH contract

    // Convert the raw values to BigNumber for accurate arithmetic
    const balanceBN = new BigNumber(balanceRaw.toString())
    const multiplier = new BigNumber(10).exponentiatedBy(WETH_DECIMALS)

    // Convert the balance into a human-readable format by dividing by 10^decimals
    const humanReadableBalance = balanceBN.dividedBy(multiplier)

    console.log(
      `WETH balance for address ${address}: ${humanReadableBalance.toString()}`
    )
    return humanReadableBalance
  } catch (error) {
    if (error instanceof RpcError) {
      console.error('Error calling contract for balance check:', error.message)
    } else {
      console.error('Unexpected error in checkBalance:', error)
    }
    return null
  }
}
