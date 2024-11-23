import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  create(createMovieDto: CreateMovieDto) {
    this.logger.log(`Creating a new movie with ${JSON.stringify(createMovieDto)}`);
    return createMovieDto;
  }

  findAll() {
    this.logger.log('Finding all movies');
    return [];
  }

  findOne(id: number) {
    this.logger.log(`This action returns a #${id} movie`);
    return {};
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    this.logger.log(`This action updates a #${id} movie`);
    return updateMovieDto;
  }

  remove(id: number) {
    this.logger.log(`This action removes a #${id} movie`);
  }
}
