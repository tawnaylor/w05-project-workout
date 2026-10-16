const router = require('express').Router();
const controller = require('../controllers/players');
const { isAuthenticated } = require('../middleware/authenticate');
const { idRules, playerRules } = require('../middleware/validate');

router.get('/', (req, res) => {
  // #swagger.tags = ['Players']
  // #swagger.summary = 'Get all player profiles'
  controller.getAll(req, res);
});

router.get('/:id', idRules, (req, res) => {
  // #swagger.tags = ['Players']
  // #swagger.summary = 'Get a player by MongoDB id'
  // #swagger.responses[400] = { description: 'Invalid MongoDB id' }
  controller.getById(req, res);
});

router.post('/', isAuthenticated, playerRules, (req, res) => {
  // #swagger.tags = ['Players']
  // #swagger.summary = 'Create a player profile'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid player payload' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/PlayerInput' }
  } */
  controller.create(req, res);
});

router.put('/:id', isAuthenticated, idRules, playerRules, (req, res) => {
  // #swagger.tags = ['Players']
  // #swagger.summary = 'Replace a player profile you own'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid id or player payload' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/PlayerInput' }
  } */
  controller.update(req, res);
});

router.delete('/:id', isAuthenticated, idRules, (req, res) => {
  // #swagger.tags = ['Players']
  // #swagger.summary = 'Delete a player profile you own'
  // #swagger.security = [{ "sessionCookie": [] }]
  // #swagger.responses[400] = { description: 'Invalid MongoDB id' }
  controller.remove(req, res);
});

module.exports = router;