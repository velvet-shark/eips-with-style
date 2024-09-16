import React from "react";
import Link from "next/link";

interface AuthorLinksProps {
  authors: string;
}

const Authors: React.FC<AuthorLinksProps> = ({ authors }) => {
  const renderAuthors = () => {
    if (!authors) return null;

    // Split the string by commas, but not within parentheses or angle brackets
    const authorParts = authors.split(/,\s*(?![^(<]*[)>])/);
    return authorParts.map((part, index) => {
      // Match GitHub username
      const githubMatch = part.match(/^(.+?)\s*\((@[\w-]+)\)\s*$/);
      if (githubMatch) {
        const [, name, username] = githubMatch;
        return (
          <React.Fragment key={index}>
            {name.trim().replace(/\s+/g, " ")}{" "}
            <span>
              (
              <Link
                href={`https://github.com/${username.slice(1)}`}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {username}
              </Link>
              )
            </span>
            {index < authorParts.length - 1 && ", "}
          </React.Fragment>
        );
      }
      // Match email
      const emailMatch = part.match(/^(.+?)\s*<(.+@.+)>\s*$/);
      if (emailMatch) {
        const [, name, email] = emailMatch;
        return (
          <React.Fragment key={index}>
            {name.trim().replace(/\s+/g, " ")}{" "}
            <span>
              (
              <Link href={`mailto:${email}`} className="text-blue-500 hover:underline">
                {email}
              </Link>
              )
            </span>
            {index < authorParts.length - 1 && ", "}
          </React.Fragment>
        );
      }

      // If no match, just return the trimmed part
      return (
        <React.Fragment key={index}>
          {part.trim()}
          {index < authorParts.length - 1 && ", "}
        </React.Fragment>
      );
    });
  };

  return <div className="block self-stretch overflow-hidden text-sm py-1">{renderAuthors()}</div>;
};

export default Authors;
