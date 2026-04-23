const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1).max(15),
  email: z.string().email(),
  password: z.string()
    .min(8).max(15, 'Maximale Länge überschritten')
    .regex(/[a-z]/, 'Muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[A-Z]/, 'Muss mindestens einen Großbuchstaben enthalten')
    .regex(/[0-9]/, 'Muss mindestens eine Zahl enthalten')
    .regex(/[^a-zA-Z0-9]/, 'Muss mindestens ein Sonderzeichen enthalten'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const subjectSchema = z.object({ name: z.string().min(1).max(100) });

const topicSchema = z.object({
  name: z.string().min(1).max(100),
  subjectId: z.number().int().positive(),
});

const progressSchema = z.object({
  topicId: z.number().int().positive(),
  value: z.number().int().min(0).max(100),
  note: z.string().max(500).optional(),
});

module.exports = { registerSchema, loginSchema, subjectSchema, topicSchema, progressSchema };
