import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MoviesModule } from '../../src/movies/movies.module';
import { mockClient } from 'aws-sdk-client-mock';
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
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/movies (GET)', () => {
    return request(app.getHttpServer())
      .get('/movies')
      .expect(200)
      .expect(ALL_MOVIES);
  });

  it('/movies/:id (GET) - findById', () => {
    return request(app.getHttpServer())
      .get('/movies/MOVIE1')
      .expect(200)
      .expect(ALL_MOVIES[0]);
  });

  it('/movies/:id (DELETE) - deleteById', () => {
    return request(app.getHttpServer())
      .delete('/movies/MOVIE1')
      .expect(200)
      .expect({});
  });

  it('/movies/:id (PATCH) - update', () => {
    const updatedMovie = {
      title: 'Updated Movie1',
      year: 2023,
    };

    return request(app.getHttpServer())
      .patch('/movies/MOVIE1')
      .send(updatedMovie)
      .expect(200)
      .expect({
        ...ALL_MOVIES[0],
        title: 'Updated Movie1',
      });
  });
});
