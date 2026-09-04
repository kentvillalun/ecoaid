export const AdminLabel = ({ children, htmlFor, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-text-primary font-medium text-sm text-start ${className}`}
    >
      {children}
    </label>
  );
};
