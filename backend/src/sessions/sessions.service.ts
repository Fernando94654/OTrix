import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {

  findAll() {
    return `This action returns all sessions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} session`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
