const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const progressSchema = z.object({
  topicId: z.number().int().positive(),
  value: z.number().int().min(0).max(100),
  note: z.string().max(500).optional(),
});

// Helper: verify topic belongs to current user via subject chain
async function ownedTopic(topicId, userId) {
  return prisma.topic.findFirst({
    where: { id: topicId },
    include: { subject: true },
  }).then(t => (t?.subject.userId === userId ? t : null));
}

// GET /api/progress?topicId=1
router.get('/', async (req, res) => {
  const topicId = parseInt(req.query.topicId);
  if (!topicId) return res.status(400).json({ error: 'topicId required' });
  if (!await ownedTopic(topicId, req.user.id)) return res.status(404).json({ error: 'Not found' });

  const entries = await prisma.progress.findMany({
    where: { topicId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(entries);
});

// POST /api/progress
router.post('/', async (req, res) => {
  const result = progressSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const { topicId, value, note } = result.data;
  if (!await ownedTopic(topicId, req.user.id)) return res.status(404).json({ error: 'Not found' });

  const entry = await prisma.progress.create({ data: { topicId, value, note } });
  res.status(201).json(entry);
});

module.exports = router;
