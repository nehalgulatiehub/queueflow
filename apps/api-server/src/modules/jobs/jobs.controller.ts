import { FastifyReply, FastifyRequest } from 'fastify';
import { createJobSchema } from '@queueflow/shared';
import { JobService } from './jobs.service.js';

export class JobController {
  constructor(private jobService: JobService) {}

  async create(
    request: FastifyRequest<{ Params: { projectId: string; queueId: string } }>,
    reply: FastifyReply
  ) {
    const body = createJobSchema.parse(request.body);
    const result = await this.jobService.createJob(
      request.params.projectId,
      request.params.queueId,
      body
    );
    const statusCode = result.isDuplicate ? 200 : 201;
    return reply.status(statusCode).send(result);
  }

  async getById(
    request: FastifyRequest<{ Params: { projectId: string; id: string } }>,
    reply: FastifyReply
  ) {
    const job = await this.jobService.getJobById(request.params.projectId, request.params.id);
    return reply.status(200).send({ job });
  }

  async list(
    request: FastifyRequest<{
      Params: { projectId: string };
      Querystring: { queueId?: string; status?: string };
    }>,
    reply: FastifyReply
  ) {
    const jobs = await this.jobService.listJobs(
      request.params.projectId,
      request.query.queueId,
      request.query.status
    );
    return reply.status(200).send({ jobs });
  }

  async cancel(
    request: FastifyRequest<{ Params: { projectId: string; id: string } }>,
    reply: FastifyReply
  ) {
    const job = await this.jobService.cancelJob(request.params.projectId, request.params.id);
    return reply.status(200).send({ message: 'Job cancelled successfully', job });
  }
}
