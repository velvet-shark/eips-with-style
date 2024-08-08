export const siteConfig = {
  name: "EIP.directory",
  title: "EIP, ERC, CAIP, and RIP Directory",
  description: "All your EIPs, ERCs, CAIPs, and RIPs in one place.",
  url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
};
