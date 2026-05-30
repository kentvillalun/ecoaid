export const IconContainer = ({icon, containerColor, className = ""}) => {
  return (
    <div className={` p-3 rounded-xl flex items-center ${className}`} style={{ backgroundColor: containerColor}}>
   
      {icon}
    </div>
  );
};
