import { createInterface } from 'readline'
import type { Address } from 'viem/accounts'
import { balanceOf, deposit, withdraw } from './contracts/weth'

async function mainMenu() {
  // Create a single readline instance to be used for the entire menu
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  // Wrapper for rl.question that returns a Promise
  const question = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve))

  while (true) {
    console.log('\nSelect an action:')
    console.log('1. Check WETH balance')
    console.log('2. Deposit ETH (wrap into WETH)')
    console.log('3. Withdraw WETH (unwrap to ETH)')
    console.log('4. Exit')

    const choice = await question('Enter action number: ')

    switch (choice.trim()) {
      case '1': {
        const address = await question('Enter the address to check balance: ')
        try {
          await balanceOf(address as Address)
        } catch (error) {
          console.error('Error checking balance:', error)
        }
        break
      }
      case '2': {
        try {
          // Create a separate CLI interface for deposit input
          const rlDeposit = createInterface({
            input: process.stdin,
            output: process.stdout,
          })
          const answer = await new Promise<string>((resolve) => {
            rlDeposit.question('Enter the amount of ETH to deposit: ', resolve)
          })
          rlDeposit.close()

          // Validate user input
          const depositValue = Number(answer)
          if (isNaN(depositValue) || depositValue <= 0) {
            console.error(
              'Invalid input. The amount must be a positive number.'
            )
            break
          }

          await deposit(depositValue)
        } catch (error) {
          console.error('Error during ETH deposit:', error)
        }
        break
      }
      case '3': {
        try {
          // Create CLI interface for input
          const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
          })
          const answer = await new Promise<string>((resolve) => {
            rl.question(
              'Enter the amount of WETH to withdraw (in ETH units): ',
              resolve
            )
          })
          rl.close()

          // Validate user input
          const withdrawValue = Number(answer)
          if (isNaN(withdrawValue) || withdrawValue <= 0) {
            console.error(
              'Invalid input. The amount must be a positive number.'
            )
            return
          }

          await withdraw(withdrawValue)
        } catch (error) {
          console.error('Error during WETH withdrawal:', error)
        }
        break
      }
      case '4':
        console.log('Exiting...')
        rl.close()
        process.exit(0)
      default:
        console.log('Invalid input. Please try again.')
    }
  }
}

mainMenu().catch((error) => console.error('Error in main menu:', error))
