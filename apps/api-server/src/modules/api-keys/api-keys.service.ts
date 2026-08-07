import { PrismaClient } from '@queueflow/database';
import { CreateApiKeyInput } from '@queueflow/shared';
import { generateApiKey } from '../../utils/api-key.js';

export class ApiKeyService {
  constructor(private prisma: PrismaClient) {}

  async createApiKey(projectId: string, input: CreateApiKeyInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const { rawKey, prefix, hash } = generateApiKey();

    let expiresAt: Date | null = null;
    if (input.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    }

    const apiKey = await this.prisma.apiKey.create({
      data: {
        projectId,
        name: input.name,
        keyPrefix: prefix,
        keyHash: hash,
        permissions: input.permissions,
        expiresAt,
      },
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      rawSecretKey: rawKey,
    };
  }

  async listApiKeys(projectId: string) {
    return this.prisma.apiKey.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(projectId: string, apiKeyId: string) {
    return this.prisma.apiKey.deleteMany({
      where: {
        id: apiKeyId,
        projectId,
      },
    });
  }
}
