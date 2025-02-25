import { createInterface } from "readline";
import { checkBalance } from "./index"; // Balance check function that takes an address as an argument
import { deposit, withdrawWETH } from "./wallet";

async function mainMenu() {
  // Create a single instance of readline that will be used for the entire menu
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Wrapper for rl.question that returns a Promise
  const question = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  while (true) {
    console.log("\nSelect an action:");
    console.log("1. Check WETH balance");
    console.log("2. Deposit ETH (wrap into WETH)");
    console.log("3. Withdraw WETH (unwrap to ETH)");
    console.log("4. Exit");

    const choice = await question("Enter action number: ");

    switch (choice.trim()) {
      case "1": {
        const address = await question("Enter the address to check balance: ");
        try {
          await checkBalance(address);
        } catch (error) {
          console.error("Error checking balance:", error);
        }
        break;
      }
      case "2": {
        try {
          await deposit();
        } catch (error) {
          console.error("Error during ETH deposit:", error);
        }
        break;
      }
      case "3": {
        try {
          await withdrawWETH();
        } catch (error) {
          console.error("Error during WETH withdrawal:", error);
        }
        break;
      }
      case "4":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
      default:
        console.log("Invalid input. Please try again.");
    }
  }
}

mainMenu().catch((error) =>
  console.error("Error in main menu:", error)
);
