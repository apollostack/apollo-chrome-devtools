import { useEffect, useLayoutEffect, useRef } from "react";

export function useInterval(callback: () => void, ms: number) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => callbackRef.current(), ms);

    return () => clearInterval(id);
  }, [ms]);
}
