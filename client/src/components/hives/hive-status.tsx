import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

type HiveStatusProps = {
  status: string;
};

const HiveStatus: React.FC<HiveStatusProps> = ({ status }) => {
  switch (status) {
    case "good":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Boa</span>
        </Badge>
      );
    case "weak":
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Fraca</span>
        </Badge>
      );
    case "dead":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          <span>Morta</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
          Desconhecido
        </Badge>
      );
  }
};

export default HiveStatus;
