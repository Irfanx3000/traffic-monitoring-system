import { useState, useEffect } from "react";

export default function useTypewriter(text, trigger) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!trigger) return;

    setOutput("");
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        setOutput((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [trigger, text]);

  return output;
}
