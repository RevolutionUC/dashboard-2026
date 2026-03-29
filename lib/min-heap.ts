export class MinHeap<T> {
  private items: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  get length() {
    return this.items.length;
  }

  get items_(): T[] {
    return this.items;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index);
      if (this.compare(this.items[p], this.items[index]) <= 0) break;
      this.swap(p, index);
      index = p;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      const l = this.leftChild(index);
      const r = this.rightChild(index);
      let smallest = index;

      if (l < this.items.length && this.compare(this.items[l], this.items[smallest]) < 0) {
        smallest = l;
      }
      if (r < this.items.length && this.compare(this.items[r], this.items[smallest]) < 0) {
        smallest = r;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  insert(item: T): void {
    this.items.push(item);
    this.heapifyUp(this.items.length - 1);
  }

  extractMin(): T | undefined {
    if (this.items.length === 0) return undefined;
    const min = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  updatePriority(index: number): void {
    this.heapifyUp(index);
    this.heapifyDown(index);
  }
}
