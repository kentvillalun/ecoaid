export const Card = ({ children, className = "", handleClick, customBorder = "" }) => {
  return (
    <div
      className={`flex bg-white shadow p-4 items-center rounded-3xl ${className}`}
      onClick={handleClick}
      style={{ border: customBorder }}
    >
      {children}
    </div>
  );
};
