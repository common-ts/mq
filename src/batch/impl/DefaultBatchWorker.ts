import {BatchWorkerConfig, Message} from '../..';
import {ErrorHandler} from '../../ErrorHandler';
import {BatchHandler} from '../BatchHandler';
import {BatchWorker} from '../BatchWorker';
import {RetryService} from '../RetryService';

export class DefaultBatchWorker<T> implements BatchWorker<T> {
  private messages: Array<Message<T>> = [];
  private latestExecutedTime: number;

  constructor(private batchSize: number, private timeout: number, private limitRetry: number,
              private repository: BatchHandler<T>,
              private retryService: RetryService<T>,
              private retryCountName: string,
              private errorHandler: ErrorHandler<T>
  ) {
    this.resetState();
  }

  batchWorkerByConfig(batchConfig: BatchWorkerConfig, repository: BatchHandler<T>, retryService: RetryService<T>, retryCountName: string, errorHandler: ErrorHandler<T>) {
    return new DefaultBatchWorker(batchConfig.batchSize, batchConfig.timeout, batchConfig.limitRetry, repository, retryService, retryCountName, errorHandler);
  }

  defaultBatchWorker(batchConfig: BatchWorkerConfig, repository: BatchHandler<T>, retryService: RetryService<T>) {
    return new DefaultBatchWorker(batchConfig.batchSize, batchConfig.timeout, batchConfig.limitRetry, repository, retryService, '', null);
  }


  onConsume(message: Message<T>, ctx?: any): void {
    if (message) {
      this.messages.push(message);
    }
    if (this.readyToExecute(ctx)) {
      this.execute(ctx);
    }
  }

  private async executeRetry(errList: Array<Message<T>>, ctx?: any) {
    let retryCount = 1;
    if (errList) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < errList.length; i++) {
        const item = errList[i];
        if (!item.attributes) {
          item.attributes = new Map<string, string>();
        }
        const rt: any = item.attributes.get(this.retryCountName);
        if (rt && isNaN(rt)) {
          retryCount = parseInt(item.attributes[this.retryCountName], 10);  
        } else {
          retryCount = 1;
        }
        retryCount++;
        if (retryCount > this.limitRetry) {
          console.log('Retry: %d . Retry limitation: %d . Message: %v.', retryCount, this.limitRetry, errList[i]);
          if (this.errorHandler) {
            this.errorHandler.handleError(ctx, item);
          }
          continue;
        } else {
          console.log('Retry: %d . Message: %v.', retryCount, item);
        }
        item.attributes[this.retryCountName] = retryCount.toString();
        await this.retryService.retry(item, ctx).catch(errRetry => {
          console.log('Cannot retry %v . Error: %s', errList[i], errRetry.toString());
        });
      }
    }
  }

  private async execute(ctx?: any) {
    const batchSize = this.messages.length;
    if (batchSize === 0) {
      this.resetState(ctx);
      return;
    }
    try {
      const errList = await this.repository.handle(this.messages);
      await this.executeRetry(errList, ctx);
    } catch (e) {
      await this.executeRetry(this.messages, ctx);
    }
    this.resetState(ctx);
  }

  private readyToExecute(ctx?: any): boolean {
    let isReady = false;
    const now = new Date().getTime();
    const batchSize = this.messages.length;
    console.log('- BatchSize; ', batchSize);
    if (batchSize > 0 && (batchSize >= this.batchSize || this.latestExecutedTime + this.timeout < now)) {
      isReady = true;
    }
    if (isReady) {
      console.log('Ready to execute: Next %d - Now %d - Batch Size %d - Size: %v - LatestExecutedTime: %v - Timeout: %v', this.latestExecutedTime + this.timeout, now, batchSize, this.batchSize, this.latestExecutedTime, this.timeout);
    } else {
      console.log('Not ready to execute: Now: %v - Batch Size: %v - Size: %v - LatestExecutedTime: %v, Timeout: %v', now, batchSize, this.batchSize, this.latestExecutedTime, this.timeout);
    }
    return isReady;
  }

  runScheduler(ctx?: any): void {
    // const second = Math.floor((this.timeout % (1000 * 60)) / 1000);
    console.log('Enter DefaultBatchWorker.RunScheduler');
    this.cron(this.timeout, () => {
      this.onConsume(null, ctx);
    });
  }

  private cron(ms: number, fn: () => void): () => void {
    function cb() {
      clearTimeout(timeout);
      timeout = setTimeout(cb, ms);
      fn();
    }

    let timeout = setTimeout(cb, ms);
    return () => {
    };
  }


  private resetState(ctx?: any) {
    this.messages.length = 0;
    this.latestExecutedTime = new Date().getTime();
  }
}
