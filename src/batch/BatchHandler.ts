import {Message} from '../model/Message';

export interface BatchHandler<T> {
  handle(data: Array<Message<T>>): Promise<Array<Message<T>>>;
}
