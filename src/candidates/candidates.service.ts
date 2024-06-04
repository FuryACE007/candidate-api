import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { every } from 'rxjs';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findCandidates(
    partTime?: boolean,
    fullTime?: boolean,
    budget?: number,
    skills: string[] = [],
  ) {
    const whereClause: any = {
      // isActive: true,
    };

    if (budget) {
      if (fullTime) {
        whereClause.fullTime = true;
        // Log after adding fullTime condition
        console.log('After adding fullTime condition:', whereClause);
      }
      if (partTime) {
        whereClause.partTime = true;
        // Log after adding partTime condition
        console.log('After adding partTime condition:', whereClause);
      }
    }
    if (skills.length > 0) {
      whereClause.skills = {
        some: {
          skill: {
            skillName: {
              in: skills,
            },
          },
        },
      };
      // Log after adding skills condition
      console.log('After adding skills condition:', whereClause);
    }
    const users = await this.prisma.mercorUsers.findMany({
      where: whereClause,
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
      availability: user.workAvailability,
      skills: user.skills.map((userSkill) => userSkill.skill.skillName),
    }));
  }

  async findAllUsers() {
    return this.prisma.mercorUserSkills.findMany();
  }
}
