import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findCandidates(
    partTime: boolean,
    fullTime: boolean,
    budget: number,
    skills: string[],
  ) {
    const users = await this.prisma.mercorUsers.findMany({
      where: {
        isActive: true,
        OR: [
          {
            fullTime: fullTime,
            fullTimeSalary: { lte: budget.toString() },
          },
          {
            partTime: partTime,
            partTimeSalary: { lte: budget.toString() },
          },
        ],
        skills: {
          some: {
            skill: {
              skillName: {
                in: skills,
              },
            },
          },
        },
      },
      select: {
        name: true,
        residence: true,
        workAvailability: true,
        fullTimeAvailability: true,
        partTimeAvailability: true,
        fullTimeSalary: true,
        partTimeSalary: true,
        skills: {
          select: {
            skill: {
              select: {
                skillName: true,
              },
            },
          },
        },
      },
    });

    return users.map((user) => ({
      name: user.name,
      country: user.residence,
      experience: user.workAvailability,
      skills: user.skills.map((userSkill) => userSkill.skill.skillName),
    }));
  }

  async findAllUsers() {
    return this.prisma.mercorUsers.findMany();
  }
}
