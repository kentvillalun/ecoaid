export const AdminInput = ({ className = "", ...props }) => {
  return (
    <input
      className={`input duration-300 ease-in-out text-base mb-0 focus-within:outline-admin-accent ${className}`}
      {...props}
    />
  );
};
