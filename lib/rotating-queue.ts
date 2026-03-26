export class RotatingQueue<T> {
  private _items: T[];
  private index = 0;

  constructor(items: T[]) {
    this._items = [...items];
  }

  get length() {
    return this._items.length;
  }

  get items(): T[] {
    return this._items;
  }

  getNext(): T {
    const item = this._items[this.index];
    this.index = (this.index + 1) % this._items.length;
    return item;
  }

  add(item: T): void {
    this._items.push(item);
  }
}
