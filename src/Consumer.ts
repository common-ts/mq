import {ConsumerCaller} from './ConsumerCaller';

export interface Consumer<T> {
  consume(caller: ConsumerCaller<T>, ctx?: any): void;
}
