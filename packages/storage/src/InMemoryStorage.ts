export class InMemoryStorage implements Storage {
  private data = new Map<string, string>();

  clear() {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  key(index: number) {
    return Array.from(this.data.keys()).at(index) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  get length() {
    return this.data.size;
  }
}
