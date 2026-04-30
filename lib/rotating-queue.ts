export class RotatingQueue<T> {
  private _items: T[];
  private index = 0;

  constructor(items: T[]) {
    this._items = [...items];
  }

  // fallow-ignore-next-line unused-class-member
  get length() {
    return this._items.length;
  }

  // fallow-ignore-next-line unused-class-member
  getNext(): T {
    const item = this._items[this.index];
    this.index = (this.index + 1) % this._items.length;
    return item;
  }

  // fallow-ignore-next-line unused-class-member
  add(item: T): void {
    this._items.push(item);
  }
}
