const router = require('express').Router();

router.get('/', (req, res) => {
  res.status(200).send('WorkoutQuest API is running. Documentation: /api-docs');
});

router.use('/auth', require('./auth'));
router.use('/workouts', require('./workouts'));
router.use('/players', require('./players'));

module.exports = router;