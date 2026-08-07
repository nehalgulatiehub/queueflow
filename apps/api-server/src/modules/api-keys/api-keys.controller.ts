import { FastifyReply, FastifyRequest } from 'fastify';
import { createApiKeySchema } from '@queueflow/shared';
import { ApiKeyService } from './api-keys.service.js';

export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  async create(request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) {
    const body = createApiKeySchema.parse(request.body);
    const result = await this.apiKeyService.createApiKey(request.params.projectId, body);
    return reply.status(201).send(result);
  }

  async list(request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) {
    const keys = await this.apiKeyService.listApiKeys(request.params.projectId);
    return reply.status(200).send({ apiKeys: keys });
  }

  async revoke(request: FastifyRequest<{ Params: { projectId: string; id: string } }>, reply: FastifyReply) {
    await this.apiKeyService.revokeApiKey(request.params.projectId, request.params.id);
    return reply.status(200).send({ message: 'API key revoked successfully' });
  }
}
