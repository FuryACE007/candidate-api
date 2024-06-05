import { Controller, Get, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  async findAll(
    @Query('message') message: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.candidatesService.findCandidates(message, page, limit);
  }

  @Get('all')
  async findAllUsers() {
    return this.candidatesService.findAllUsers();
  }
}
