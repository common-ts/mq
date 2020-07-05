import {BatchWriterModel} from '../model/BatchWriterModel';

export interface BatchWriter<T> {
  writeBatch(models: T[]): Promise<BatchWriterModel>;
}
