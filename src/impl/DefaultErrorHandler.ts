import {Message} from '..';
import {ErrorHandler} from '../ErrorHandler';

export class DefaultErrorHandler<T> implements ErrorHandler<T> {

  handleError(message: Message<T>, ctx?: any): Promise<void> {
    console.log('Fail after all retries: %v', message);
    return undefined;
  }
}
