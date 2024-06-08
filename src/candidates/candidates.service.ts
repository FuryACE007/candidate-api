import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER, CacheKey, CacheStore } from '@nestjs/cache-manager';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
  ) {}

  @CacheKey(
    'candidates-${JSON.stringify({partTime, fullTime, budget, skills, page, limit})}',
  )
  async findCandidates(
    partTime?: boolean,
    fullTime?: boolean,
    budget?: number,
    skills: string[] = [],
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

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
      skip: offset,
      take: Number(limit),
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

    const rankedUsers = this.rankUsers(
      users,
      partTime,
      fullTime,
      budget,
      skills,
    );

    return rankedUsers.map((user) => ({
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

  rankUsers(
    users: any[],
    partTime?: boolean,
    fullTime?: boolean,
    budget?: number,
    skills: string[] = [],
  ) {
    const weights = {
      partTime: 1,
      fullTime: 2,
      budget: 3,
      skills: 5,
    };

    const rankedUsers = users.map((user) => {
      const userSkills = user.skills.map(
        (userSkill) => userSkill.skill.skillName,
      );
      const matchingSkills = skills.filter((skill) =>
        userSkills.includes(skill),
      );
      const skillWeight = matchingSkills.length * weights.skills;

      return {
        ...user,
        score:
          (partTime ? weights.partTime : 0) +
          (fullTime ? weights.fullTime : 0) +
          (Number(user.fullTimeSalary) <= budget ? weights.budget : 0) +
          (Number(user.partTimeSalary) <= budget ? weights.budget : 0) +
          skillWeight,
      };
    });

    return rankedUsers.sort((a, b) => b.score - a.score);
  }
}
