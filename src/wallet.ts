import dotenv from "dotenv";
import abi from "./abi.json";
import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import BigNumber from "bignumber.js";
import { createInterface } from "readline";
import { stdin as input, stdout as output } from "process";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Проверяем корректность PRIVATE_KEY: должен начинаться с "0x" и содержать 64 шестнадцатеричных символа
if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.error(
    "Ошибка: Некорректный PRIVATE_KEY. Ожидается hex-строка, начинающаяся с '0x' и содержащая 64 шестнадцатеричных символа."
  );
  process.exit(1);
}

// Создаем объект аккаунта из приватного ключа
const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(RPC_URL),
  account,
});

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export async function deposit() {
  try {
    // Создаем CLI-интерфейс для ввода
    const rl = createInterface({ input, output });
    const answer = await new Promise<string>((resolve) => {
      rl.question("Введите сумму ETH для депозита: ", resolve);
    });
    rl.close();

    // Валидация пользовательского ввода
    const depositValue = Number(answer);
    if (isNaN(depositValue) || depositValue <= 0) {
      console.error("Неверный ввод. Сумма должна быть положительным числом.");
      return;
    }

    // Преобразуем введенную сумму в BigNumber
    const depositAmountBN = new BigNumber(answer);
    // Переводим ETH в wei (учитываем 18 знаков после запятой)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18);
    const depositAmountWeiStr = depositAmountBN.multipliedBy(weiMultiplier).toFixed(0);
    const depositAmountWei = BigInt(depositAmountWeiStr);

    console.log(`Внесение ${answer} ETH (${depositAmountWeiStr} wei) в контракт WETH...`);

    // Вызов платежной функции deposit() с передачей ETH (value)
    const txHash = await walletClient.writeContract({
      address: wethAddress,
      abi: abi,
      functionName: "deposit",
      args: [],
      value: depositAmountWei,
    });

    console.log("Транзакция отправлена. Хэш транзакции:", txHash);
  } catch (error) {
    console.error("Ошибка при депозите ETH:", error instanceof Error ? error.message : error);
  }
}

export async function withdrawWETH() {
  try {
    // Создаем CLI-интерфейс для ввода суммы
    const rl = createInterface({ input, output });
    const answer = await new Promise<string>((resolve) => {
      rl.question("Введите сумму WETH для вывода (в ETH): ", resolve);
    });
    rl.close();

    // Валидация ввода
    const withdrawValue = Number(answer);
    if (isNaN(withdrawValue) || withdrawValue <= 0) {
      console.error("Неверный ввод. Сумма должна быть положительным числом.");
      return;
    }

    // Преобразуем введенную сумму в BigNumber
    const withdrawAmountBN = new BigNumber(answer);
    // Переводим ETH в wei (учитывая 18 десятичных знаков)
    const weiMultiplier = new BigNumber(10).exponentiatedBy(18);
    const withdrawAmountWeiStr = withdrawAmountBN.multipliedBy(weiMultiplier).toFixed(0);
    const withdrawAmountWei = BigInt(withdrawAmountWeiStr);

    console.log(`Вывод ${answer} WETH (${withdrawAmountWeiStr} wei) обратно в ETH...`);

    // Вызываем функцию withdraw(uint256) для вывода WETH
    const txHash = await walletClient.writeContract({
      address: wethAddress,
      abi: abi,
      functionName: "withdraw",
      args: [withdrawAmountWei],
    });

    console.log("Транзакция отправлена. Хэш транзакции:", txHash);
  } catch (error) {
    console.error("Ошибка при выводе WETH:", error instanceof Error ? error.message : error);
  }
}

// Для тестирования можно вызвать одну из функций, например:
// deposit().catch(console.error);
// withdrawWETH().catch(console.error);
