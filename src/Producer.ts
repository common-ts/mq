
export interface Producer<T> {
  produce(data: T, attributes: Map<string, string>, ctx?: any): Promise<string>;
}
