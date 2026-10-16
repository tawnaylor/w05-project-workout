const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const collection = () => getDb().collection('workouts');

const buildWorkout = (body, playerId) => ({
  name: body.name,
  type: body.type,
  difficulty: body.difficulty,
  durationMinutes: body.durationMinutes,
  xpReward: body.xpReward,
  exercises: body.exercises || [],
  completed: body.completed ?? false,
  completedAt: body.completed ? new Date() : null,
  playerId
});

const getAll = async (req, res) => {
  try {
    res.status(200).json(await collection().find().toArray());
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve workouts' });
  }
};

const getById = async (req, res) => {
  try {
    const workout = await collection().findOne({ _id: new ObjectId(req.params.id) });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    return res.status(200).json(workout);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve workout' });
  }
};

const create = async (req, res) => {
  try {
    const result = await collection().insertOne(buildWorkout(req.body, req.user._id));
    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create workout' });
  }
};

const update = async (req, res) => {
  try {
    const result = await collection().replaceOne(
      { _id: new ObjectId(req.params.id), playerId: req.user._id },
      buildWorkout(req.body, req.user._id)
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Workout not found' });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update workout' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await collection().deleteOne({ _id: new ObjectId(req.params.id), playerId: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Workout not found' });
    return res.status(200).json({ message: 'Workout deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete workout' });
  }
};

module.exports = { create, getAll, getById, remove, update };