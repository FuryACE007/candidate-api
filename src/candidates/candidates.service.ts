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
    let users = await this.prisma.mercorUsers.findMany({
      where: whereClause,
      select: {
        name: true,
        residence: true,
        workAvailability: true,
        fullTimeAvailability: true,
        partTimeAvailability: true,
        fullTimeSalary: true,
        partTimeSalary: true,
        fullTimeSalaryCurrency: true, // Add this line
        partTimeSalaryCurrency: true, // Add this line
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

    if (budget) {
      users = users.filter((user) =>
        fullTime
          ? Number(user.fullTimeSalary) <= budget
          : Number(user.partTimeSalary) <= budget,
      );
    }

    return users.map((user) => ({
      name: user.name,
      country: user.residence,
      availability: user.workAvailability,
      skills: user.skills.map((userSkill) => userSkill.skill.skillName),
      fullTimeSalaryCurrency: fullTime
        ? user.fullTimeSalaryCurrency
        : undefined,
      fullTimeSalary: fullTime ? user.fullTimeSalary : undefined,
      partTimeSalaryCurrency: partTime
        ? user.partTimeSalaryCurrency
        : undefined,
      partTimeSalary: partTime ? user.partTimeSalary : undefined,
    }));
  }

  async findAllUsers() {
    return this.prisma.mercorUserSkills.findMany();
  }
}
