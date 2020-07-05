import {Message} from '../model/Message';

export interface RetryService<T> {
  retry(message: Message<T>, ctx?: any): Promise<void>;
}
