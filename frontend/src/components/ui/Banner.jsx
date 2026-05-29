
import { statusBannerMessage, statusStyles } from "@/lib/statusStyles";

export const Banner = ({status, className = ""}) => {
  return (
    <div className={`p-4 ${statusStyles[status]} text-center new-border font-semibold ${className}`}>
        {statusBannerMessage[status]}
    </div>
  )
};
