import {ConsumerCaller} from '../../ConsumerCaller';
import {Message} from '../../index';
import {Validator} from '../../Validator';
import {BatchWorker} from '../BatchWorker';

export class BatchConsumerCaller<T> implements ConsumerCaller<T> {
  constructor(private batchWorker: BatchWorker<T>, private validator: Validator<T>) {
  }

  call(msg: Message<T>, err?: Error, ctx?: any): Promise<void> {
    if (err) {
      console.log('Error: ', err);
      return;
    }
    if (!msg) {
      console.log('Do not proceed empty message');
      return;
    }
    if (!this.validator) {
      this.batchWorker.onConsume(msg, ctx);
      return;
    }
    return this.validator.validate(msg, ctx).then(() => {
      this.batchWorker.onConsume(msg, ctx);
    }).catch(err2 => {
      console.log('Do not proceed empty message', err2);
    });
  }
}
