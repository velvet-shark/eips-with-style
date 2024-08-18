import React from "react";
import { Link as LinkIcon } from "lucide-react";

interface LinkItemProps {
  official_url?: string;
  github_url?: string;
  discussion_url?: string;
  links?: string[];
}

const LinkItem: React.FC<LinkItemProps> = ({ official_url, github_url, discussion_url, links }) => {
  return (
    <div className="flex flex-col space-y-1">
      {official_url && (
        <a
          href={official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-start"
        >
          <LinkIcon className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
          Official EIP page
        </a>
      )}
      {github_url && (
        <a
          href={github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-start"
        >
          <LinkIcon className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
          GitHub page
        </a>
      )}
      {discussion_url && (
        <a
          href={discussion_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-start"
        >
          <LinkIcon className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
          Discussion on Ethereum Magicians
        </a>
      )}
      {links && links.length > 0 && (
        <>
          {links?.map((link, index) => (
            <a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all flex items-start"
            >
              <LinkIcon className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
              {link}
            </a>
          ))}
        </>
      )}
    </div>
  );
};

export default LinkItem;
