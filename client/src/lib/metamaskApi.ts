// src/lib/metamaskApi.ts
// Tích hợp thanh toán MetaMask với Ganache (local blockchain)
 
// Địa chỉ ví nhận tiền của shop (lấy từ Ganache - account đầu tiên)
// ⚠️ Thay bằng địa chỉ ví Ganache của bạn
const SHOP_WALLET_ADDRESS = "0x820800fD178704ad9a9670Ed27Fa8073d74CCC33";

// Kiểm tra MetaMask có được cài không
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
};
 
// Kết nối ví MetaMask, trả về địa chỉ ví
export const connectMetaMask = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask chưa được cài đặt! Vui lòng cài MetaMask extension.");
  }
 
  try {
    // Yêu cầu người dùng kết nối ví
    const accounts: string[] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
 
    if (!accounts || accounts.length === 0) {
      throw new Error("Không thể lấy địa chỉ ví. Vui lòng thử lại.");
    }
 
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Bạn đã từ chối kết nối ví MetaMask.");
    }
    throw new Error(error.message || "Lỗi khi kết nối MetaMask.");
  }
};
 
// Chuyển đổi USD sang ETH (giả lập - dùng tỷ giá cố định cho đồ án)
// 1 ETH = 2000 USD (có thể điều chỉnh)
export const usdToEth = (usdAmount: number): string => {
  const ETH_PRICE_USD = 2000;
  const ethAmount = usdAmount / ETH_PRICE_USD;
  // Làm tròn 6 chữ số thập phân
  return ethAmount.toFixed(6);
};
 
// Chuyển ETH sang Wei (đơn vị nhỏ nhất của ETH)
export const ethToWei = (ethAmount: string): string => {
  const eth = parseFloat(ethAmount);
 const wei = BigInt(Math.floor(eth * 1e18));
  return "0x" + wei.toString(16);
};
 
// Kiểm tra xem đang dùng mạng Ganache (chainId 1337 hoặc 5777)
export const checkGanacheNetwork = async (): Promise<void> => {
  const chainId = await window.ethereum!.request({ method: "eth_chainId" });
  const ganacheChainIds = ["0x539", "0x1691"]; // 1337 và 5777 dạng hex
 
  if (!ganacheChainIds.includes(chainId)) {
    // Thử switch sang Ganache network
    try {
      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x539" }], // 1337
      });
    } catch (switchError: any) {
      // Nếu chưa có network Ganache, thêm vào
      if (switchError.code === 4902) {
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x539",
              chainName: "Ganache Local",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:7545"], // Port mặc định Ganache GUI
              // Nếu dùng ganache-cli thì đổi thành 8545
            },
          ],
        });
      } else {
        throw new Error("Vui lòng chuyển sang mạng Ganache trong MetaMask.");
      }
    }
  }
};
 
export interface MetaMaskPaymentResult {
  success: boolean;
  transactionHash: string;
  from: string;
  amountEth: string;
  amountUsd: number;
}
 
// Hàm chính: Thanh toán bằng MetaMask
export const payWithMetaMask = async (
  amountUSD: number,
  recipientAddress?: string
): Promise<MetaMaskPaymentResult> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask chưa được cài đặt!");
  }
 
  // 1. Kết nối ví
  const fromAddress = await connectMetaMask();
 
  // 2. Kiểm tra network Ganache
  await checkGanacheNetwork();
 
  // 3. Tính toán số ETH cần gửi
  const ethAmount = usdToEth(amountUSD);
  const weiAmount = ethToWei(ethAmount);
  const toAddress = recipientAddress || SHOP_WALLET_ADDRESS;
 
  // 4. Gửi transaction
  try {
    const txHash: string = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to: toAddress,
          value: weiAmount,
          gas: "0x5208", // 21000 gas - chuẩn cho ETH transfer
        },
      ],
    });
 
    return {
      success: true,
      transactionHash: txHash,
      from: fromAddress,
      amountEth: ethAmount,
      amountUsd: amountUSD,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Bạn đã hủy giao dịch.");
    }
    throw new Error(error.message || "Giao dịch thất bại.");
  }
};