import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaProducerService {
  private readonly kafkaInstance: Kafka;
  private producer: Producer;

  constructor( private configService: ConfigService ) {
    this.kafkaInstance = new Kafka({
      clientId: configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [configService.get<string>('KAFKA_BROKER')],
      connectionTimeout: parseInt(configService.get<string>('KAFKA_CONNECTION_TIMEOUT')),
      authenticationTimeout: parseInt(configService.get<string>('KAFKA_AUTHENTICATION_TIMEOUT')),
      reauthenticationThreshold: parseInt(configService.get<string>('KAFKA_REAUTHENTICATION_THRESHOLD')),
    });

    this.producer = this.kafkaInstance.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  }

  async publish(kafkaTopic: string, message: any): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
