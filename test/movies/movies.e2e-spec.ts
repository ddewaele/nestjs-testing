import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MoviesModule } from '../../src/movies/movies.module';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const ALL_MOVIES = [
    {
      PK: 'MOVIE1',
      SK: '001',
      title: 'Movie1',
      year: 2023,
    },
    {
      PK: 'MOVIE2',
      SK: '002',
      title: 'Movie2',
      year: 2024,
    },
  ];

  beforeEach(async () => {
    ddbMock.reset();
    ddbMock.on(QueryCommand).resolves({
      Items: ALL_MOVIES,
    });
    ddbMock.on(GetCommand).resolves({
      Item: ALL_MOVIES[0],
    });
    ddbMock.on(DeleteCommand).resolves({});
    ddbMock.on(UpdateCommand).resolves({
      Attributes: {
        ...ALL_MOVIES[0],
        title: 'Updated Movie1',
      },
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MoviesModule],
    })
      .setLogger(new ConsoleLogger())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/movies (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .expect(200);

    expect(response.body).toEqual(ALL_MOVIES);

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
      TableName: 'MoviesTable',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'MOVIE' },
    });
  });

  it('/movies/:id (GET) - findById', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies/123')
      .expect(200)
      .expect(ALL_MOVIES[0]);

    expect(ddbMock).toHaveReceivedCommandTimes(GetCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: 'MoviesTable',
      Key: {
        PK: 'MOVIE',
        SK: '123',
      },
    });

    return response;
  });

  it('/movies/:id (DELETE) - deleteById', async () => {
    await request(app.getHttpServer())
      .delete('/movies/123')
      .expect(200)
      .expect({});

    expect(ddbMock).toHaveReceivedCommandTimes(DeleteCommand, 1);

    expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: 'MoviesTable',
      Key: {
        PK: 'MOVIE',
        SK: '123',
      },
    });
  });

  it('/movies/:id (PATCH) - update', async () => {
    const updatedMovie = {
      title: 'Updated Movie1',
      year: 2023,
    };

    await request(app.getHttpServer())
      .patch('/movies/123')
      .send(updatedMovie)
      .expect(200)
      .expect({
        ...ALL_MOVIES[0],
        title: 'Updated Movie1',
      });

    expect(ddbMock).toHaveReceivedCommandTimes(UpdateCommand, 1);

    expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: 'MoviesTable',
      Key: {
        PK: 'MOVIE',
        SK: '123',
      },
      UpdateExpression: 'SET #key0 = :value0, #key1 = :value1',
      ExpressionAttributeNames: {
        '#key0': 'title',
        '#key1': 'year',
      },
      ExpressionAttributeValues: {
        ':value0': 'Updated Movie1',
        ':value1': 2023,
      },
      ReturnValues: 'ALL_NEW',
    });
  });
});
