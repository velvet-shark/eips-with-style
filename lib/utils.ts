import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceImageUrls(content: string): string {
  const baseUrl = "https://eips.ethereum.org";

  return content.replace(/!\[(.*?)\]\((\.\.\/assets\/.*?)\)/g, (match, altText, relativePath) => {
    const fullUrl = `${baseUrl}${relativePath.slice(2)}`;
    return `![${altText}](${fullUrl})`;
  });
}
