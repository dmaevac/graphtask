// import { Iterator } from '../utils/Iterable';
import LinkedList from './LinkedList';

export default class Stack<T = any> {
  linkedList: LinkedList<T>;

  constructor() {
    this.linkedList = new LinkedList<T>();
  }

  isEmpty(): boolean {
    // The stack is empty if its linked list doesn't have a head.
    return !this.linkedList.head;
  }

  peek(): T | undefined {
    if (this.isEmpty()) {
      // If the linked list is empty then there is nothing to peek from.
      return;
    }

    // Just read the value from the start of linked list without deleting it.
    return this.linkedList.head?.value;
  }

  push(value: T): void {
    // Pushing means to lay the value on top of the stack. Therefore let's just add
    // the new value at the start of the linked list.
    this.linkedList.prepend(value);
  }

  pop(): T | undefined {
    // Let's try to delete the first node (the head) from the linked list.
    // If there is no head (the linked list is empty) just return null.
    const removedHead = this.linkedList.deleteHead();
    return removedHead?.value;
  }

  *toList(): Generator<T> {
    for (const x of this.linkedList) {
      yield x
    }
  }

  toString(): string {
    return this.linkedList.toString();
  }
}
