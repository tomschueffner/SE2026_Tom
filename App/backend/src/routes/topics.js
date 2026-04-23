const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { topicSchema } = require('../validation/schemas');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: verify that a subject belongs to the current user
async function ownedSubject(subjectId, userId) {
  return prisma.subject.findFirst({ where: { id: subjectId, userId } });
}

// GET /api/topics?subjectId=1
router.get('/', async (req, res) => {
  const subjectId = parseInt(req.query.subjectId);
  if (!subjectId) return res.status(400).json({ error: 'subjectId required' });
  if (!await ownedSubject(subjectId, req.user.id)) return res.status(404).json({ error: 'Not found' });

  const topics = await prisma.topic.findMany({
    where: { subjectId },
    include: { progress: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  res.json(topics);
});

// POST /api/topics
router.post('/', async (req, res) => {
  const result = topicSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const { name, subjectId } = result.data;
  if (!await ownedSubject(subjectId, req.user.id)) return res.status(404).json({ error: 'Not found' });

  const topic = await prisma.topic.create({ data: { name, subjectId } });
  res.status(201).json(topic);
});

// PATCH /api/topics/:id  – rename
router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = topicSchema.pick({ name: true }).safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const topic = await prisma.topic.findFirst({ where: { id }, include: { subject: true } });
  if (!topic || topic.subject.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.topic.update({ where: { id }, data: { name: result.data.name } });
  res.json(updated);
});

// DELETE /api/topics/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const topic = await prisma.topic.findFirst({ where: { id }, include: { subject: true } });
  // Verify ownership via subject → userId (IDOR)
  if (!topic || topic.subject.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });

  await prisma.topic.delete({ where: { id } });
  res.json({ ok: true });
});

module.exports = router;
