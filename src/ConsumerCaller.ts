import {Message} from './model/Message';

export interface ConsumerCaller<T> {
  call(msg: Message<T>, err?: Error, ctx?: any): Promise<void>;
}

