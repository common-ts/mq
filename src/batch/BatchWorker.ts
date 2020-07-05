import {Message} from '../model/Message';

export interface BatchWorker<T> {
  onConsume(message: Message<T>, ctx?: any): void;
  runScheduler(ctx: any): void;
}
