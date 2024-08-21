import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceImageUrls(content: string, proposalType: string): string {
  let baseUrl: string;

  switch (proposalType.toUpperCase()) {
    case "EIP":
    case "ERC":
      baseUrl = "https://eips.ethereum.org";
      break;
    case "RIP":
      baseUrl = "https://raw.githubusercontent.com/ethereum/RIPs/master";
      break;
    case "CAIP":
      baseUrl = "https://raw.githubusercontent.com/ChainAgnostic/CAIPs/main";
      break;
    default:
      baseUrl = "https://eips.ethereum.org"; // Default to EIP/ERC base URL
  }

  return content.replace(/!\[(.*?)\]\((\.\.\/assets\/.*?)\)/g, (match, altText, relativePath) => {
    const fullUrl = `${baseUrl}${relativePath.slice(2)}`;
    return `![${altText}](${fullUrl})`;
  });
}
