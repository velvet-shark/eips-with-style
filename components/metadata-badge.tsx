import React from "react";
import { LucideIcon } from "lucide-react";

interface MetadataBadgeProps {
  color: string;
  icon: LucideIcon;
  content: string;
}

const MetadataBadge: React.FC<MetadataBadgeProps> = ({ color, icon: Icon, content }) => {
  return (
    <span className={`inline-flex items-center rounded-full ${color} px-2 py-1 text-xs font-medium`}>
      <Icon className="mr-1 h-3 w-3" />
      {content}
    </span>
  );
};

export default MetadataBadge;
