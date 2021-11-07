export const Iterator = {
  *map<T, U>(f: (t: T, idx: number) => U, it: IterableIterator<T>): Generator<U> {
    let idx = 0;
    for (const x of it) yield f(x, idx++);
  },
  *filter<T>(f: (t: T) => boolean, it: IterableIterator<T>): Generator<T> {
    for (const x of it) if (f(x)) yield x;
  },
};
