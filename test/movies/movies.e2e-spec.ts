import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MoviesModule } from '../../src/movies/movies.module';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

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
    // Mock the DynamoDB ScanCommand response
    ddbMock.reset(); // Reset the mock before each test
    ddbMock.on(QueryCommand).resolves({
      Items: ALL_MOVIES,
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
});
