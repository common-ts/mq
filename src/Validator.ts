import {Message} from './model/Message';

export interface Validator<T> {
  validate(message: Message<T>, ctx?: any): Promise<boolean>;
}
