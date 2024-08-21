/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => void>(
  this: any,
  ms: number,
  fn: T
): T {
  let timer: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => fn.call(this, ...args), ms);
  }) as T;
}
