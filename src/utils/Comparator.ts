

type SortValue = 0 | 1 | -1;
export default class Comparator<A> {
  compare: <A>(a: A, b: A) => SortValue;

  constructor(compareFunction?: <A>(a: A, b: A) => SortValue) {
    this.compare = compareFunction || Comparator.defaultCompareFunction;
  }

  static defaultCompareFunction<A>(a: A, b: A): SortValue {
    if (a === b) return 0;

    return a < b ? -1 : 1;
  }

  equal(a: A, b: A): boolean {
    return this.compare(a, b) === 0;
  }

  lessThan(a: A, b: A): boolean {
    return this.compare(a, b) < 0;
  }

  greaterThan(a: A, b: A): boolean {
    return this.compare(a, b) > 0;
  }

  lessThanOrEqual(a: A, b: A): boolean {
    return this.lessThan(a, b) || this.equal(a, b);
  }

  greaterThanOrEqual(a: A, b: A): boolean {
    return this.greaterThan(a, b) || this.equal(a, b);
  }

  reverse(): void {
    const compareOriginal = this.compare;
    this.compare = (a, b) => compareOriginal(b, a);
  }
}
