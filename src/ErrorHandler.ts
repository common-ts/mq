import {Message} from './model/Message';

export interface ErrorHandler<T> {
  handleError(message: Message<T>, ctx?: any): Promise<void>;
}
