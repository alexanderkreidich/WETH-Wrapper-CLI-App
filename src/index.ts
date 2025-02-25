import BigNumber from 'bignumber.js'
import promptSync from 'prompt-sync'
import type { Address } from 'viem/accounts'
import { publicClient, walletClient } from './client'
import { balanceOf, deposit, withdraw } from './contracts/weth'

// Initialize prompt-sync
const prompt = promptSync()

const address = walletClient.account.address

async function mainMenu() {
  while (true) {
    console.log('---------------------')
    console.log(`\nAddress: ${address}`)
    console.log('\nSelect an action:\n')
    console.log('0. Check native ETH balance')
    console.log('1. Check WETH balance')
    console.log('2. Deposit ETH (wrap into WETH)')
    console.log('3. Withdraw WETH (unwrap to ETH)')
    console.log('4. Exit')

    const choice = prompt('Enter action number: ')

    switch (choice.trim()) {
      case '0': {
        try {
          const nativeBalance = await publicClient.getBalance({ address })
          // Convert nativeBalance (in wei) to ETH
          const balanceBN = new BigNumber(nativeBalance.toString())
          const ethBalance = balanceBN.dividedBy(
            new BigNumber(10).exponentiatedBy(18)
          )
          console.log(
            `Native ETH balance for address ${address}: ${ethBalance.toString()} ETH`
          )
        } catch (error) {
          console.error('Error checking native ETH balance:', error)
        }
        break
      }
      case '1': {
        try {
          const wethBalance = await balanceOf(address as Address)
          console.log(`WETH balance for address ${address}: ${wethBalance}`)
        } catch (error) {
          console.error('Error checking WETH balance:', error)
        }
        break
      }
      case '2': {
        try {
          const answer = prompt('Enter the amount of ETH to deposit: ')
          // Validate user input
          const depositValue = Number(answer)
          if (isNaN(depositValue) || depositValue <= 0) {
            console.error(
              'Invalid input. The amount must be a positive number.'
            )
            break
          }

          const txHash = await deposit(depositValue)
          console.log('Transaction sent. Transaction hash:', txHash)
        } catch (error) {
          console.error('Error during ETH deposit:', error)
        }
        break
      }
      case '3': {
        try {
          const answer = prompt(
            'Enter the amount of WETH to withdraw (in ETH units): '
          )
          // Validate user input
          const withdrawValue = Number(answer)
          if (isNaN(withdrawValue) || withdrawValue <= 0) {
            console.error(
              'Invalid input. The amount must be a positive number.'
            )
            break
          }

          const txHash = await withdraw(withdrawValue)
          console.log('Transaction sent. Transaction hash:', txHash)
        } catch (error) {
          console.error('Error during WETH withdrawal:', error)
        }
        break
      }
      case '4': {
        console.log('Exiting...')
        process.exit(0)
      }
      default:
        console.log('Invalid input. Please try again.')
    }
  }
}

mainMenu().catch((error) => console.error('Error in main menu:', error))
