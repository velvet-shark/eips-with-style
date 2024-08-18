import React from "react";
import { LucideIcon } from "lucide-react";
import { Proposal } from "@/lib/types"; // Adjust this import path as needed

interface MetadataItemProps {
  icon: LucideIcon;
  label: string;
  proposal: Proposal;
}

const MetadataItem: React.FC<MetadataItemProps> = ({ icon: Icon, label, proposal }) => {
  return (
    <div className="relative flex items-start p-0 overflow-hidden">
      <div className="flex self-stretch items-start flex-row flex-shrink-0 w-36 min-w-36 group text-sm py-1 text-muted-foreground font-medium">
        <div>
          <Icon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
        </div>
        {label}
      </div>
      <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
        {proposal.status} / {proposal.type}: {proposal.category} / {proposal.created_at}
      </div>
    </div>
  );
};

export default MetadataItem;
