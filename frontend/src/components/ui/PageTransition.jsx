import { motion } from "motion/react";

export const PageTransition = ({className = "", children, style= ""}) => {
  return (
    <motion.div
        style={{ display: `${style}` }}
      className={`min-w-full min-h-full ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
