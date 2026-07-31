export const Card = ({ children, className = "", handleClick, customBorder = "" }) => {
  return (
    <div
      className={`flex bg-surface new-border p-4 items-center rounded-2xl ${className}`}
      onClick={handleClick}
      style={{ border: customBorder }}
    >
      {children}
    </div>
  );
};
