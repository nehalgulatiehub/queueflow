import { FastifyReply, FastifyRequest } from 'fastify';
import { createQueueSchema, updateQueueStatusSchema } from '@queueflow/shared';
import { QueueService } from './queues.service.js';

export class QueueController {
  constructor(private queueService: QueueService) {}

  async create(request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) {
    const body = createQueueSchema.parse(request.body);
    const queue = await this.queueService.createQueue(request.params.projectId, body);
    return reply.status(201).send({ queue });
  }

  async list(request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) {
    const queues = await this.queueService.listQueues(request.params.projectId);
    return reply.status(200).send({ queues });
  }

  async getById(request: FastifyRequest<{ Params: { projectId: string; id: string } }>, reply: FastifyReply) {
    const queue = await this.queueService.getQueueById(request.params.projectId, request.params.id);
    return reply.status(200).send({ queue });
  }

  async pause(request: FastifyRequest<{ Params: { projectId: string; id: string } }>, reply: FastifyReply) {
    await this.queueService.updateQueueStatus(request.params.projectId, request.params.id, 'PAUSED');
    return reply.status(200).send({ message: 'Queue paused successfully' });
  }

  async resume(request: FastifyRequest<{ Params: { projectId: string; id: string } }>, reply: FastifyReply) {
    await this.queueService.updateQueueStatus(request.params.projectId, request.params.id, 'ACTIVE');
    return reply.status(200).send({ message: 'Queue resumed successfully' });
  }

  async delete(request: FastifyRequest<{ Params: { projectId: string; id: string } }>, reply: FastifyReply) {
    await this.queueService.deleteQueue(request.params.projectId, request.params.id);
    return reply.status(200).send({ message: 'Queue deleted successfully' });
  }
}
