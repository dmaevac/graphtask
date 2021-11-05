import LinkedList from './LinkedList';

export default class Queue<T = any> {
  linkedList: LinkedList<T>;

  constructor() {
    this.linkedList = new LinkedList<T>();
  }

  isEmpty(): boolean {
    return !this.linkedList.head;
  }

  peek(): T | null {
     return this.linkedList.head?.value || null;
  }

  enqueue(value: T) {
    this.linkedList.append(value);
  }

  dequeue(): T | null {
    const removedHead = this.linkedList.deleteHead();
    return removedHead?.value || null;
  }

  toString(callback: Function): string {
    return this.linkedList.toString(callback);
  }
}
