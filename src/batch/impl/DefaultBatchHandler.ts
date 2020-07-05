import {Message} from '../../index';
import {BatchHandler} from '../BatchHandler';
import {BatchWriter} from '../BatchWriter';

export class DefaultBatchHandler<T> implements BatchHandler<T> {
  private batchWriter: BatchWriter<T>;

  constructor(batchWriter: BatchWriter<T>) {
    this.batchWriter = batchWriter;
    this.handle = this.handle.bind(this);
  }

  handle(messages: Array<Message<T>>): Promise<Array<Message<T>>> {
    const successMessages = new Array<T>();
    messages.forEach(message => {
      if (message && message.data != null) {
        successMessages.push(message.data);
      }
    });
    return new Promise<Array<Message<T>>>((resolve, reject) => {
      this.batchWriter.writeBatch(successMessages).then((data) => {
        const failMessages = [];
        const size = messages.length;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < data.failIndices.length; i++) {
          const index = data.failIndices[i];
          if (index < size) {
            failMessages.push(messages[index]);
          }
        }
        console.log('writeBatch ', data);
        resolve(failMessages);
      }).catch(err => {
        console.log('Cannot do bulk write: %v  Error: %s', successMessages, err.toString());
        reject(err);
      });
    });
  }
}
