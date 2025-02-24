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

    // Преобразуем значения в BigNumber
    const totalSupplyBN = new BigNumber(totalSupply.toString());
    // Вычисляем множитель в виде 10^decimals
    const multiplier = new BigNumber(10).exponentiatedBy(Number(decimals));
    // Делим общее количество на множитель для получения человеческого формата
    const humanReadableSupply = totalSupplyBN.dividedBy(multiplier);

    return humanReadableSupply;
  } catch (error) {
    if (error instanceof RpcError) {
      console.error("Ошибка при вызове контракта для withdrawWETH:", error.message);
    } else {
      console.error("Непредвиденная ошибка в withdrawWETH:", error);
    }
    return null;
  }
}

export async function checkBalance(address: string) {
  // Валидируем адрес с помощью регулярного выражения
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.error("Неверный адрес. Убедитесь, что адрес начинается с 0x и содержит 40 шестнадцатеричных символов.");
    return null;
  }

  // Адрес WETH контракта (проверьте, что адрес записан с правильной контрольной суммой)
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  try {
    // Получаем баланс (raw-значение) для заданного аккаунта
    const balanceRaw = await publicClient.readContract({
      address: wethAddress,
      abi: abi,
      functionName: "balanceOf",
      args: [address]
    }) as bigint;

    // Получаем количество знаков (decimals) контракта WETH
    const decimalsRaw = await publicClient.readContract({
      address: wethAddress,
      abi: abi,
      functionName: "decimals",
      args: []
    });

    // Преобразуем raw-значения в BigNumber для корректной арифметики
    const balanceBN = new BigNumber(balanceRaw.toString());
    const multiplier = new BigNumber(10).exponentiatedBy(Number(decimalsRaw));

    // Получаем значение в человекочитаемом формате, деля баланс на 10^decimals
    const humanReadableBalance = balanceBN.dividedBy(multiplier);

    console.log(`Баланс WETH для адреса ${address}: ${humanReadableBalance.toString()}`);
    return humanReadableBalance;
  } catch (error) {
    if (error instanceof RpcError) {
      console.error("Ошибка при вызове контракта для проверки баланса:", error.message);
    } else {
      console.error("Непредвиденная ошибка в checkBalance:", error);
    }
    return null;
  }
}
