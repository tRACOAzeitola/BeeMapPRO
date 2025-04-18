import { ArchiveIcon, ALargeSmall, HeartPulseIcon, AlertTriangleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendType: "positive" | "negative" | "warning" | "neutral";
  color: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType,
  color = "primary", // Default value
}) => {
  // Map color to Tailwind class and icon
  const colorMap = {
    primary: {
      bgLight: "bg-amber-100/15 dark:bg-amber-900/25",
      text: "text-amber-500",
    },
    secondary: {
      bgLight: "bg-green-100/15 dark:bg-green-900/25",
      text: "text-green-500",
    },
    success: {
      bgLight: "bg-green-100/15 dark:bg-green-900/25",
      text: "text-green-500",
    },
    danger: {
      bgLight: "bg-red-100/15 dark:bg-red-900/25",
      text: "text-red-500",
    },
    warning: {
      bgLight: "bg-amber-100/15 dark:bg-amber-900/25",
      text: "text-amber-500",
    },
    info: {
      bgLight: "bg-blue-100/15 dark:bg-blue-900/25",
      text: "text-blue-500",
    },
  };

  // Default color if the provided color is not in the map
  const colorClasses = colorMap[color] || colorMap.primary;

  const trendColorMap = {
    positive: "text-green-500",
    negative: "text-red-500",
    warning: "text-amber-500",
    neutral: "text-gray-500",
  };

  // Map icon string to icon component
  const getIcon = () => {
    switch (icon) {
      case "th-large":
        return <ALargeSmall className="w-5 h-5" />;
      case "archive":
        return <ArchiveIcon className="w-5 h-5" />;
      case "heartbeat":
        return <HeartPulseIcon className="w-5 h-5" />;
      case "exclamation-triangle":
        return <AlertTriangleIcon className="w-5 h-5" />;
      default:
        return <ALargeSmall className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-card">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">{value}</h3>
        </div>
        <div
          className={`w-10 h-10 rounded-full ${colorClasses.bgLight} flex items-center justify-center ${colorClasses.text}`}
        >
          {getIcon()}
        </div>
      </div>
      <p className={`${trendColorMap[trendType]} text-xs font-medium mt-2 flex items-center`}>
        {trendType === "positive" && <TrendIcon type="up" />}
        {trendType === "negative" && <TrendIcon type="down" />}
        {trendType === "warning" && <TrendIcon type="down" />}
        {trend}
      </p>
    </Card>
  );
};

type TrendIconProps = {
  type: "up" | "down";
};

const TrendIcon = ({ type }: TrendIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-3 w-3 mr-1 ${type === "down" ? "transform rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
};

export default StatsCard;
