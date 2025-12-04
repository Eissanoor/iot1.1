const express = require('express');
const router = express.Router();
const prismaController = require('../controllers/prismaController');

// Route to generate Prisma client
router.post('/generate', prismaController.generatePrisma);

// Route to git pull from main branch
router.post('/git-pull', prismaController.gitPull);

module.exports = router;

