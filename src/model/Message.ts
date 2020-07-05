export class Message<T> {
  id?: string;
  attributes?: Map<string, string>;
  data: T;
  raw?: any;
}
