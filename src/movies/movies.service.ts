import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Logger, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  // ScanCommand, EVIL !!!!!!!!
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ulid } from 'ulid';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  private readonly tableName = 'MoviesTable';
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      endpoint: 'http://localhost:8000',
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  async create(createMovieDto: CreateMovieDto) {
    this.logger.log(
      `Creating a new movie with ${JSON.stringify(createMovieDto)}`,
    );

    const Item = {
      PK: `MOVIE`,
      SK: ulid(),
      title: createMovieDto.title,
      year: createMovieDto.year,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item,
        ReturnValues: 'ALL_OLD',
      }),
    );

    return Item;
  }

  async findAll() {
    this.logger.log('Finding all movies');

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'MOVIE',
      },
    };

    const result = await this.client.send(new QueryCommand(params));
    return result.Items || [];
  }

  async findOne(id: string) {
    this.logger.log(`This action returns a #${id} movie`);
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: 'MOVIE',
          SK: id,
        },
      }),
    );
    // return result.Item as Movie || null;
    return result.Item || null;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    this.logger.log(`This action updates a #${id} movie`);

    const updateExpression = Object.keys(updateMovieDto)
      .map((key, idx) => `#key${idx} = :value${idx}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updateMovieDto).reduce(
      (acc, key, idx) => ({ ...acc, [`#key${idx}`]: key }),
      {},
    );

    const expressionAttributeValues = Object.keys(updateMovieDto).reduce(
      (acc, key, idx) => ({ ...acc, [`:value${idx}`]: updateMovieDto[key] }),
      {},
    );

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: 'MOVIE',
          SK: id,
        },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes; // as Movie;

    // return updateMovieDto;
  }

  async remove(id: string) {
    this.logger.log(`This action removes a #${id} movie`);
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: 'MOVIE',
          SK: id,
        },
      }),
    );
  }
}
