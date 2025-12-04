const express = require('express');
const router = express.Router();
const prismaController = require('../controllers/prismaController');

// Route to generate Prisma client
router.post('/generate', prismaController.generatePrisma);

// Route to git pull from main branch
router.post('/git-pull', prismaController.gitPull);

// Route to npm install
router.post('/npm-install', prismaController.npmInstall);

// Route to execute any terminal command
router.post('/execute', prismaController.executeCommand);

// Route to get terminal activity logs (for Postman - returns JSON)
router.get('/terminal-logs', prismaController.getTerminalLogs);

// Route to stream terminal activity (console logs) in real-time (for browser/SSE)
router.get('/terminal-activity', prismaController.getTerminalActivity);

module.exports = router;

