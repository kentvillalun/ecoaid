export const AdminLabel = ({ children, htmlFor, className = "", required = false }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-text-primary font-medium text-sm text-start ${className}`}
    >
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};
