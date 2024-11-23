## Description

Sample [Nest](https://github.com/nestjs/nest) project using TypeScript with a simple CRUD controller to demonstrate testing

 

## Starting a NestJS project

The script was created using the NestJS CLI

```
nest new nestjs-testing
```

We then proceeded to create our Movie resource
```
base ❯ nest g resource
? What name would you like to use for this resource (plural, e.g., "users")? movies
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/movies/movies.controller.spec.ts (576 bytes)
CREATE src/movies/movies.controller.ts (915 bytes)
CREATE src/movies/movies.module.ts (255 bytes)
CREATE src/movies/movies.service.spec.ts (460 bytes)
CREATE src/movies/movies.service.ts (623 bytes)
CREATE src/movies/dto/create-movie.dto.ts (31 bytes)
CREATE src/movies/dto/update-movie.dto.ts (173 bytes)
CREATE src/movies/entities/movie.entity.ts (22 bytes)
UPDATE package.json (1986 bytes)
UPDATE src/app.module.ts (316 bytes)
✔ Packages installed successfully.
```



## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
