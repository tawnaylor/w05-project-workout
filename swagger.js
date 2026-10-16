require('dotenv').config();
const fs = require('node:fs');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'WorkoutQuest API',
    description: 'Workout tracking and player progression API. Mutations require a GitHub-authenticated session.',
    version: '1.0.0'
  },
  servers: [
    { url: process.env.API_BASE_URL || 'http://localhost:3000', description: 'Configured API server' }
  ],
  components: {
    securitySchemes: {
      sessionCookie: { type: 'apiKey', in: 'cookie', name: 'workoutquest.sid' }
    },
    schemas: {
      WorkoutInput: {
        name: 'Push Day',
        type: 'strength',
        difficulty: 5,
        durationMinutes: 45,
        xpReward: 150,
        exercises: [{ name: 'Push-ups', sets: 3, reps: 12 }],
        completed: false
      },
      PlayerInput: {
        username: 'tawnaylor',
        displayName: 'Taw',
        email: 'taw@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        totalXp: 0,
        level: 1
      }
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    spec.components.schemas = {
      WorkoutInput: {
        type: 'object',
        required: ['name', 'type', 'difficulty', 'durationMinutes', 'xpReward'],
        properties: {
          name: { type: 'string', minLength: 1, example: 'Push Day' },
          type: { type: 'string', enum: ['strength', 'cardio', 'mobility'], example: 'strength' },
          difficulty: { type: 'integer', minimum: 1, maximum: 10, example: 5 },
          durationMinutes: { type: 'integer', minimum: 1, maximum: 300, example: 45 },
          xpReward: { type: 'integer', minimum: 0, example: 150 },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'sets', 'reps'],
              properties: {
                name: { type: 'string', example: 'Push-ups' },
                sets: { type: 'integer', minimum: 1, example: 3 },
                reps: { type: 'integer', minimum: 1, example: 12 }
              }
            }
          },
          completed: { type: 'boolean', example: false }
        }
      },
      PlayerInput: {
        type: 'object',
        required: ['username', 'displayName', 'email'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30, example: 'tawnaylor' },
          displayName: { type: 'string', minLength: 1, example: 'Taw' },
          email: { type: 'string', format: 'email', example: 'taw@example.com' },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          totalXp: { type: 'integer', minimum: 0, default: 0, example: 0 },
          level: { type: 'integer', minimum: 1, default: 1, example: 1 }
        }
      }
    };

    for (const pathItem of Object.values(spec.paths)) {
      for (const operation of Object.values(pathItem)) {
        if (!operation || typeof operation !== 'object' || !Array.isArray(operation.parameters)) continue;
        const bodyParameter = operation.parameters.find((parameter) => parameter.in === 'body');
        if (!bodyParameter) continue;
        operation.parameters = operation.parameters.filter((parameter) => parameter.in !== 'body');
        operation.requestBody = {
          required: bodyParameter.required,
          content: { 'application/json': { schema: bodyParameter.schema } }
        };
      }
    }

    fs.writeFileSync(outputFile, `${JSON.stringify(spec, null, 2)}\n`);
  })
  .catch((error) => {
    console.error('Failed to generate API documentation:', error);
    process.exitCode = 1;
  });