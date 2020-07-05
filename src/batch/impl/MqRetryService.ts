import {Message} from '../../model/Message';
import {Producer} from '../../Producer';
import {RetryService} from '../RetryService';

export class MqRetryService<T> implements RetryService<T> {

  constructor(private producer: Producer<T>) {
  }

  retry(message: Message<T>, ctx?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.producer.produce(message.data, message.attributes).then((data) => {
        console.log(`Retry put to mq success.`);
        resolve();
      }).catch(err => {
        console.log(`Retry put to mq error: %s`, err.toString());
        reject(err);
      });
    });
  }

}
