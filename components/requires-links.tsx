import Link from "next/link";

interface RequiresLinksProps {
  requires: string[];
}

const RequiresLinks: React.FC<RequiresLinksProps> = ({ requires }) => {
  return (
    <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
      {requires.map((number, index) => (
        <Link key={number} href={`/eips/eip-${number}`} className="text-blue-500 hover:underline">
          EIP-{number}
          {index < requires.length - 1 ? ", " : ""}
        </Link>
      ))}
    </div>
  );
};

export default RequiresLinks;
