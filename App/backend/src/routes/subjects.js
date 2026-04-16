const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const subjectSchema = z.object({ name: z.string().min(1).max(100) });

// GET /api/subjects
router.get('/', async (req, res) => {
  const subjects = await prisma.subject.findMany({
    where: { userId: req.user.id }, // IDOR: always filter by userId
    include: {
      topics: {
        include: { progress: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(subjects);
});

// POST /api/subjects
router.post('/', async (req, res) => {
  const result = subjectSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const subject = await prisma.subject.create({
    data: { name: result.data.name, userId: req.user.id },
  });
  res.status(201).json(subject);
});

// DELETE /api/subjects/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  // findFirst with userId — user can only delete their own subjects
  const subject = await prisma.subject.findFirst({ where: { id, userId: req.user.id } });
  if (!subject) return res.status(404).json({ error: 'Not found' });

  await prisma.subject.delete({ where: { id } });
  res.json({ ok: true });
});

module.exports = router;
