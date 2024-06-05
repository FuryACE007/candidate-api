import { Controller, Get, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  async findAll(
    @Query('partTime') partTime: string,
    @Query('fullTime') fullTime: string,
    @Query('budget') budget: number,
    @Query('skills') skills: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.candidatesService.findCandidates(
      partTime === 'true',
      fullTime === 'true',
      budget,
      skills ? skills.split(',') : [],
      page,
      limit,
    );
  }

  @Get('all')
  async findAllUsers() {
    return this.candidatesService.findAllUsers();
  }
}
