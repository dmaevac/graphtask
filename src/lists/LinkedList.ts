import Comparator from "../utils/Comparator";

class LinkedListNode<T> {
  value: T;

  next?: LinkedListNode<T>;

  constructor(value: T, next?: LinkedListNode<T>) {
    this.value = value;
    this.next = next;
  }

  toString(callback: Function) {
    return callback ? callback(this.value) : `${this.value}`;
  }
}

export default class LinkedList<T = any> {
  head?: LinkedListNode<T>;

  tail?: LinkedListNode<T>;

  private compare: Comparator<T>;

  constructor(comparatorFunction?: <A>(a: A, b: A) => 0 | 1 | -1) {
    this.compare = new Comparator(comparatorFunction);
  }

  prepend(value: T) {
    const newNode = new LinkedListNode<T>(value, this.head);
    this.head = newNode;

    // If there is no tail yet let's make new node a tail.
    if (!this.tail) {
      this.tail = newNode;
    }

    return this;
  }

  append(value: T) {
    const newNode = new LinkedListNode<T>(value);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;

      return this;
    }

    if (this.tail) this.tail.next = newNode;
    this.tail = newNode;

    return this;
  }

  delete(value: T) {
    if (!this.head) {
      return null;
    }

    let deletedNode = null;

    // If the head must be deleted then make next node that is different
    // from the head to be a new head.
    while (this.head && this.compare.equal(this.head.value, value)) {
      deletedNode = this.head;
      this.head = this.head.next;
    }

    let currentNode = this.head;

    if (currentNode !== null) {
      // If next node must be deleted then make next node to be a next next one.
      while (currentNode?.next) {
        if (this.compare.equal(currentNode.next.value, value)) {
          deletedNode = currentNode.next;
          currentNode.next = currentNode.next.next;
        } else {
          currentNode = currentNode.next;
        }
      }
    }

    // Check if tail must be deleted.
    if (this.tail && this.compare.equal(this.tail.value, value)) {
      this.tail = currentNode;
    }

    return deletedNode;
  }

  find({ value = undefined, callback = undefined }: { value?: T; callback?: (val: T) => boolean; }) {
    if (!this.head) {
      return null;
    }

    let currentNode: LinkedListNode<T> | undefined = this.head;

    while (currentNode) {
      // If callback is specified then try to find node by callback.
      if (callback && callback(currentNode.value)) {
        return currentNode;
      }

      // If value is specified then try to compare by value..
      if (value !== undefined && this.compare.equal(currentNode.value, value)) {
        return currentNode;
      }

      currentNode = currentNode.next;
    }

    return null;
  }

  deleteTail() {
    const deletedTail = this.tail;

    if (this.head === this.tail) {
      // There is only one node in linked list.
      this.head = undefined;
      this.tail = undefined;

      return deletedTail;
    }

    // If there are many nodes in linked list...

    // Rewind to the last node and delete "next" link for the node before the last one.
    let currentNode = this.head;
    while (currentNode?.next) {
      if (!currentNode.next.next) {
        currentNode.next = undefined;
      } else {
        currentNode = currentNode.next;
      }
    }

    this.tail = currentNode;

    return deletedTail;
  }

  deleteHead() {
    if (!this.head) {
      return;
    }

    const deletedHead = this.head;

    if (this.head.next) {
      this.head = this.head.next;
    } else {
      this.head = undefined;
      this.tail = undefined;
    }

    return deletedHead;
  }

  /**
   * @param {*[]} values - Array of values that need to be converted to linked list.
   * @return {LinkedList}
   */
  fromArray(values: T[]): LinkedList<T> {
    values.forEach((value) => this.append(value));

    return this;
  }

  /**
   * @return {LinkedListNode[]}
   */
  toArray(): LinkedListNode<T>[] {
    const nodes = [];

    let currentNode = this.head;
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }

    return nodes;
  }

  toString(callback: Function) {
    return this.toArray().map((node) => node.toString(callback)).toString();
  }

  /**
   * Reverse a linked list.
   * @returns {LinkedList}
   */
  reverse(): LinkedList<T> {
    let currNode = this.head;
    let prevNode = undefined;
    let nextNode = undefined;

    while (currNode) {
      // Store next node.
      nextNode = currNode.next;

      // Change next node of the current node so it would link to previous node.
      currNode.next = prevNode;

      // Move prevNode and currNode nodes one step forward.
      prevNode = currNode;
      currNode = nextNode;
    }

    // Reset head and tail.
    this.tail = this.head;
    this.head = prevNode;

    return this;
  }
}
