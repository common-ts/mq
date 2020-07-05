import {Message} from '..';
import {Validator} from '../Validator';

export class DefaultValidator<T> implements Validator<T> {
  constructor() {
  }

  validate(message: Message<T>, ctx?: any): Promise<boolean> {
    return new Promise(resolve => resolve(true));
  }
}
