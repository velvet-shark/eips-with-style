import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", width = 40, height = 40 }) => {
  return (
    <div className={`md:flex items-center gap-x-2 ${className}`}>
      <Image src="/eip-logo.svg" height={height} width={width} alt="Logo" className="dark:hidden" />
      <Image src="/eip-logo-dark.svg" height={height} width={width} alt="Logo" className="hidden dark:block" />
    </div>
  );
};
