import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

/**
 * AvalancheService
 * 用于连接 Avalanche C-Chain，并与智能合约交互
 */
export class AvalancheService {
  private web3: Web3;
  private contract: any;
  private account: any;

  constructor(
    private rpcUrl: string,
    private contractAddress: string,
    private contractABI: any
  ) {
    // 创建 Web3 连接
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

    const privateKey = process.env.AVA_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("❌ 缺少 AVA_PRIVATE_KEY");
    }

    // 从私钥创建账户对象
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(this.account);

    // 创建智能合约实例
    this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  /**
   * 读取智能合约的公开数据
   * example: contract.methods.getPlayerElo(address).call()
   */
  async call(method: string, ...params: any[]) {
    try {
      return await (this.contract.methods as any)[method](...params).call();
    } catch (error) {
      console.error("call error:", error);
      throw error;
    }
  }

  /**
   * 写入智能合约（需要消耗 gas）
   * example: contract.methods.updateElo(player, elo).send()
   */
  async send(method: string, ...params: any[]) {
    try {
      const tx = (this.contract.methods as any)[method](...params);

      const gas = await tx.estimateGas({ from: this.account.address });

      const receipt = await tx.send({
        from: this.account.address,
        gas,
      });

      return receipt;
    } catch (error) {
      console.error("send error:", error);
      throw error;
    }
  }

  /**
   * 给玩家转账（奖励 token / AVAX）
   */
  async sendAvax(to: string, amountInAvax: string) {
    const value = this.web3.utils.toWei(amountInAvax, "ether");

    return await this.web3.eth.sendTransaction({
      from: this.account.address,
      to,
      value,
    });
  }
}
