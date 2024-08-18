import Link from "next/link";

interface RequiresLinksProps {
  requires: string[];
}

const RequiresLinks: React.FC<RequiresLinksProps> = ({ requires }) => {
  return (
    <div className="block self-stretch overflow-hidden text-sm py-1">
      {requires.map((number, index) => (
        <>
          <Link key={number} href={`/eips/eip-${number}`} className="text-blue-500 hover:underline">
            EIP-{number}
          </Link>
          {index < requires.length - 1 && ", "}
        </>
      ))}
    </div>
  );
};

export default RequiresLinks;
