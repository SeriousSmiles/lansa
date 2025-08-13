import * as React from "react";

// Simple test component to verify React is working
const TestComponent: React.FC = () => {
  console.log("TestComponent rendering, React available:", !!React);
  console.log("useState available:", typeof React.useState);
  console.log("useEffect available:", typeof React.useEffect);
  
  const [test] = React.useState("React is working!");
  
  React.useEffect(() => {
    console.log("useEffect working in TestComponent");
  }, []);
  
  return React.createElement("div", { 
    style: { 
      position: "fixed", 
      top: 0, 
      right: 0, 
      background: "green", 
      color: "white", 
      padding: "10px",
      zIndex: 9999,
      fontSize: "12px"
    } 
  }, test);
};

export default TestComponent;