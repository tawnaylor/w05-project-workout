const router = require('express').Router();
const controller = require('../controllers/workouts');
const { isAuthenticated } = require('../middleware/authenticate');
const { idRules, workoutRules } = require('../middleware/validate');

router.get('/', (req, res) => {
  // #swagger.tags = ['Workouts']
  // #swagger.summary = 'Get all workouts'
  controller.getAll(req, res);
});

router.get('/:id', idRules, (req, res) => {
  // #swagger.tags = ['Workouts']
  // #swagger.summary = 'Get a workout by MongoDB id'
  // #swagger.responses[400] = { description: 'Invalid MongoDB id' }
  controller.getById(req, res);
});

router.post('/', isAuthenticated, workoutRules, (req, res) => {
  // #swagger.tags = ['Workouts']
  // #swagger.summary = 'Create a workout for the signed-in player'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid workout payload' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/WorkoutInput' }
  } */
  controller.create(req, res);
});

router.put('/:id', isAuthenticated, idRules, workoutRules, (req, res) => {
  // #swagger.tags = ['Workouts']
  // #swagger.summary = 'Replace a workout owned by the signed-in player'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid id or workout payload' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/WorkoutInput' }
  } */
  controller.update(req, res);
});

router.delete('/:id', isAuthenticated, idRules, (req, res) => {
  // #swagger.tags = ['Workouts']
  // #swagger.summary = 'Delete a workout owned by the signed-in player'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid MongoDB id' }
  controller.remove(req, res);
});

module.exports = router;