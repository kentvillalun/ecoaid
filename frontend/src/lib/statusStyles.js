export const statusStyles = {
    REQUESTED: "bg-warning/10 text-warning",
    APPROVED: "bg-info/10 text-info",
    IN_PROGRESS: "bg-in-progress/10 text-in-progress",
    REJECTED: "bg-error/10 text-error",
    COLLECTED: "bg-success/10 text-success",
    CANCELLED: "bg-gray-200 text-gray-700",
    EXPIRED: "bg-gray-200 text-gray-700",
    NOT_SCHEDULED: "bg-gray-200 text-gray-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
  };

export const statusLabels = {
    REQUESTED : "Pending",
    APPROVED: "Approved",
    IN_PROGRESS: "In Progress",
    REJECTED: "Rejected",
    COLLECTED: "Collected",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    NOT_SCHEDULED: "Not Scheduled",
    SCHEDULED: "Scheduled",
  };
  
export const statusBannerMessage = {
    REQUESTED : "Your request is pending review",
    APPROVED: "Your request has been approved",
    IN_PROGRESS: "Your recyclables are scheduled for collection",
    REJECTED: "Your request has been declined",
    COLLECTED: "Your request has been completed",
    CANCELLED: "You cancelled this request",
    EXPIRED: "This request expired due to inactivity",
}