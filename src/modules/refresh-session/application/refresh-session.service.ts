import { Injectable } from '@nestjs/common';
import { RefreshSessionRepository } from '../infastructure';

@Injectable()
export class RefreshSessionService {
  constructor(
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}
  async createRefreshSession(body): Promise<any> {
    return this.refreshSessionRepository.create(body);
  }

  async getRefreshSession(query): Promise<any[]> {
    return this.refreshSessionRepository.find(query);
  }

  async deleteRefreshSessionById(query): Promise<void> {
    await this.refreshSessionRepository.delete(query);
  }

  async updateRefreshSessionByUserId(userId: string, body: any): Promise<any> {
    return this.refreshSessionRepository.updateAndGet({ userId }, body);
  }
}
