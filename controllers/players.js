const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const collection = () => getDb().collection('players');
const canManage = (player, userId) => player._id.equals(userId) || player.createdBy?.equals(userId);

const getAll = async (req, res) => {
  try {
    const players = await collection().find({}, { projection: { email: 0, githubId: 0 } }).toArray();
    return res.status(200).json(players);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve players' });
  }
};

const getById = async (req, res) => {
  try {
    const player = await collection().findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { email: 0, githubId: 0 } }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    return res.status(200).json(player);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve player' });
  }
};

const create = async (req, res) => {
  try {
    const player = {
      username: req.body.username,
      displayName: req.body.displayName,
      email: req.body.email,
      githubId: null,
      avatarUrl: req.body.avatarUrl || null,
      totalXp: req.body.totalXp ?? 0,
      level: req.body.level ?? 1,
      createdAt: new Date(),
      createdBy: req.user._id
    };
    const result = await collection().insertOne(player);
    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'username or email already in use' });
    return res.status(500).json({ message: 'Unable to create player' });
  }
};

const update = async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const player = await collection().findOne({ _id: id });
    if (!player || !canManage(player, req.user._id)) {
      return res.status(404).json({ message: 'Player not found' });
    }
    const result = await collection().updateOne(
      { _id: id },
      {
        $set: {
          username: req.body.username,
          displayName: req.body.displayName,
          email: req.body.email,
          avatarUrl: req.body.avatarUrl || null,
          totalXp: req.body.totalXp ?? player.totalXp,
          level: req.body.level ?? player.level
        }
      }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Player not found' });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'username or email already in use' });
    return res.status(500).json({ message: 'Unable to update player' });
  }
};

const remove = async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const player = await collection().findOne({ _id: id });
    if (!player || !canManage(player, req.user._id)) {
      return res.status(404).json({ message: 'Player not found' });
    }
    const result = await collection().deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Player not found' });
    return res.status(200).json({ message: 'Player deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete player' });
  }
};

module.exports = { create, getAll, getById, remove, update };