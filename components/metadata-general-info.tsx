import React from "react";
import MetadataBadge from "@/components/metadata-badge";
import {
  ClockIcon,
  TagIcon,
  FolderIcon,
  CheckCircleIcon,
  FileTextIcon,
  AlertCircleIcon,
  XCircleIcon
} from "lucide-react";

type StatusType = keyof typeof statusConfig;

interface MetadataGeneralInfoProps {
  status: StatusType;
  type: string;
  category: string;
  createdAt: string;
}

const statusConfig = {
  Living: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
  Final: { color: "bg-blue-100 text-blue-800", icon: CheckCircleIcon },
  "Last Call": { color: "bg-yellow-100 text-yellow-800", icon: AlertCircleIcon },
  Review: { color: "bg-purple-100 text-purple-800", icon: FileTextIcon },
  Draft: { color: "bg-gray-100 text-gray-800", icon: FileTextIcon },
  Stagnant: { color: "bg-orange-100 text-orange-800", icon: AlertCircleIcon },
  Withdrawn: { color: "bg-red-100 text-red-800", icon: XCircleIcon }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toISOString().split("T")[0];
};

const MetadataGeneralInfo: React.FC<MetadataGeneralInfoProps> = ({ status, type, category, createdAt }) => {
  const { color, icon } = statusConfig[status];

  return (
    <div className="flex flex-wrap gap-2">
      <MetadataBadge color={color} icon={icon} content={`Status: ${status}`} />
      <MetadataBadge color="bg-green-100 text-green-800" icon={FolderIcon} content={`${type}: ${category}`} />
      <MetadataBadge color="bg-gray-100 text-gray-800" icon={ClockIcon} content={`Created: ${formatDate(createdAt)}`} />
    </div>
  );
};

export default MetadataGeneralInfo;
