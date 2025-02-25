import { createInterface } from "readline";
import { checkBalance } from "./index"; // Функция проверки баланса, которая принимает адрес как аргумент
import { deposit, withdrawWETH } from "./wallet";

async function mainMenu() {
  // Создаем один экземпляр readline, который будет использоваться во всем меню
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Обёртка для rl.question, возвращающая Promise
  const question = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  while (true) {
    console.log("\nВыберите действие:");
    console.log("1. Проверить баланс WETH");
    console.log("2. Депозит ETH (обернуть в WETH)");
    console.log("3. Вывод WETH (распаковать в ETH)");
    console.log("4. Выход");

    const choice = await question("Введите номер действия: ");

    switch (choice.trim()) {
      case "1": {
        const address = await question("Введите адрес для проверки баланса: ");
        try {
          await checkBalance(address);
        } catch (error) {
          console.error("Ошибка при проверке баланса:", error);
        }
        break;
      }
      case "2": {
        try {
          await deposit();
        } catch (error) {
          console.error("Ошибка при депозите ETH:", error);
        }
        break;
      }
      case "3": {
        try {
          await withdrawWETH();
        } catch (error) {
          console.error("Ошибка при выводе WETH:", error);
        }
        break;
      }
      case "4":
        console.log("Выход...");
        rl.close();
        process.exit(0);
      default:
        console.log("Неверный ввод. Попробуйте снова.");
    }
  }
}

mainMenu().catch((error) =>
  console.error("Ошибка в главном меню:", error)
);
