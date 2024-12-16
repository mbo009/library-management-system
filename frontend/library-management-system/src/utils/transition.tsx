import { motion } from "framer-motion";
import { FC } from "react";

const transition = <P extends object>(Component: FC<P>) => {
  const WrappedComponent: FC<P> = (props) => (
    <motion.div
      className="slide-in"
      initial={{ x: "100%" }} // Start off-screen to the right
      animate={{ x: 0 }} // Slide into position
      exit={{ x: "-100%" }} // Slide out to the left
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Component {...props} />
    </motion.div>
  );

  WrappedComponent.displayName = `Transition(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

export default transition;
