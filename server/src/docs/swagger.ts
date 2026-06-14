import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const bearer = [{ bearerAuth: [] }];
const ok = { description: 'Success' };
const created = { description: 'Created' };

const jsonBody = (props: Record<string, unknown>, required?: string[]) => ({
  required: true,
  content: { 'application/json': { schema: { type: 'object', required, properties: props } } },
});

const str = { type: 'string' };
const num = { type: 'number' };

/** Hand-authored OpenAPI spec covering the Nexus REST API. Served at /api/docs. */
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Nexus API',
      version: '1.0.0',
      description:
        'Investor & Entrepreneur collaboration platform. JWT access token in `Authorization: Bearer`, refresh via httpOnly cookie.',
    },
    servers: [{ url: `http://localhost:${env.PORT}/api`, description: 'Local' }],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Meetings' },
      { name: 'Documents' },
      { name: 'Payments' },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        Error: { type: 'object', properties: { error: { type: 'object', properties: { message: str } } } },
        AuthResponse: {
          type: 'object',
          properties: { accessToken: str, user: { $ref: '#/components/schemas/User' } },
        },
        User: {
          type: 'object',
          properties: {
            id: str, name: str, email: str, role: { type: 'string', enum: ['entrepreneur', 'investor'] },
            avatarUrl: str, bio: str, isOnline: { type: 'boolean' }, twoFactorEnabled: { type: 'boolean' },
          },
        },
        Meeting: {
          type: 'object',
          properties: {
            id: str, title: str, description: str, start: str, end: str, roomId: str,
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'cancelled'] },
            organizer: { $ref: '#/components/schemas/User' }, attendee: { $ref: '#/components/schemas/User' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: str, originalName: str, mimeType: str, size: num,
            status: { type: 'string', enum: ['uploaded', 'pending_signature', 'signed'] },
            uploadedBy: { $ref: '#/components/schemas/User' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: str, type: { type: 'string', enum: ['deposit', 'withdraw', 'transfer'] },
            direction: { type: 'string', enum: ['in', 'out'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            amount: num, currency: str, description: str,
          },
        },
      },
    },
    paths: {
      '/auth/register': { post: { tags: ['Auth'], summary: 'Register', requestBody: jsonBody({ name: str, email: str, password: str, role: str }, ['name', 'email', 'password', 'role']), responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } } } } },
      '/auth/login': { post: { tags: ['Auth'], summary: 'Login (may return twoFactorRequired)', requestBody: jsonBody({ email: str, password: str }, ['email', 'password']), responses: { 200: ok } } },
      '/auth/verify-2fa': { post: { tags: ['Auth'], summary: 'Verify 2FA code', requestBody: jsonBody({ pendingToken: str, code: str }, ['pendingToken', 'code']), responses: { 200: ok } } },
      '/auth/refresh': { post: { tags: ['Auth'], summary: 'Rotate tokens via refresh cookie', responses: { 200: ok } } },
      '/auth/logout': { post: { tags: ['Auth'], summary: 'Logout (revoke refresh)', responses: { 200: ok } } },
      '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Request password reset', requestBody: jsonBody({ email: str }, ['email']), responses: { 200: ok } } },
      '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password with token', requestBody: jsonBody({ token: str, password: str }, ['token', 'password']), responses: { 200: ok } } },

      '/users/me': {
        get: { tags: ['Users'], summary: 'Current profile', security: bearer, responses: { 200: ok } },
        patch: { tags: ['Users'], summary: 'Update profile', security: bearer, requestBody: jsonBody({ name: str, bio: str, twoFactorEnabled: { type: 'boolean' } }), responses: { 200: ok } },
      },
      '/users/{id}': { get: { tags: ['Users'], summary: 'Get user by id', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } } },
      '/investors': { get: { tags: ['Users'], summary: 'List investors (paginated)', security: bearer, parameters: [{ name: 'page', in: 'query', schema: num }, { name: 'limit', in: 'query', schema: num }, { name: 'search', in: 'query', schema: str }], responses: { 200: ok } } },
      '/entrepreneurs': { get: { tags: ['Users'], summary: 'List entrepreneurs (paginated)', security: bearer, responses: { 200: ok } } },

      '/meetings': {
        get: { tags: ['Meetings'], summary: 'List my meetings', security: bearer, parameters: [{ name: 'scope', in: 'query', schema: { type: 'string', enum: ['upcoming', 'past', 'all'] } }, { name: 'status', in: 'query', schema: str }], responses: { 200: ok } },
        post: { tags: ['Meetings'], summary: 'Schedule a meeting (409 on overlap)', security: bearer, requestBody: jsonBody({ attendee: str, title: str, start: str, end: str }, ['attendee', 'title', 'start', 'end']), responses: { 201: created, 409: { description: 'Time conflict' } } },
      },
      '/meetings/{id}/accept': { patch: { tags: ['Meetings'], summary: 'Accept (invitee only)', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } } },
      '/meetings/{id}/reject': { patch: { tags: ['Meetings'], summary: 'Reject (invitee only)', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } } },
      '/meetings/{id}/cancel': { patch: { tags: ['Meetings'], summary: 'Cancel', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } } },

      '/documents': {
        get: { tags: ['Documents'], summary: 'List my + shared documents', security: bearer, responses: { 200: ok } },
        post: { tags: ['Documents'], summary: 'Upload (multipart: file)', security: bearer, requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 201: created } },
      },
      '/documents/{id}': {
        get: { tags: ['Documents'], summary: 'Get document', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } },
        delete: { tags: ['Documents'], summary: 'Delete (owner only)', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: ok } },
      },
      '/documents/{id}/file': { get: { tags: ['Documents'], summary: 'Stream file (auth)', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], responses: { 200: { description: 'Binary file' } } } },
      '/documents/{id}/sign': { post: { tags: ['Documents'], summary: 'Apply e-signature', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], requestBody: jsonBody({ signature: str }, ['signature']), responses: { 200: ok } } },
      '/documents/{id}/share': { post: { tags: ['Documents'], summary: 'Share with users (owner only)', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: str }], requestBody: jsonBody({ userIds: { type: 'array', items: str } }, ['userIds']), responses: { 200: ok } } },

      '/payments/wallet': { get: { tags: ['Payments'], summary: 'Balance + recent transactions', security: bearer, responses: { 200: ok } } },
      '/payments/transactions': { get: { tags: ['Payments'], summary: 'Transaction history (paginated)', security: bearer, responses: { 200: ok } } },
      '/payments/deposit': { post: { tags: ['Payments'], summary: 'Deposit (Stripe PaymentIntent or simulated)', security: bearer, requestBody: jsonBody({ amount: num }, ['amount']), responses: { 201: created } } },
      '/payments/withdraw': { post: { tags: ['Payments'], summary: 'Withdraw (400 if insufficient)', security: bearer, requestBody: jsonBody({ amount: num }, ['amount']), responses: { 201: created } } },
      '/payments/transfer': { post: { tags: ['Payments'], summary: 'Transfer to another user', security: bearer, requestBody: jsonBody({ to: str, amount: num, note: str }, ['to', 'amount']), responses: { 201: created } } },
    },
  },
  apis: [],
});
