const { exec } = require('child_process');
const path = require('path');

// Generate Prisma Client
exports.generatePrisma = async (req, res) => {
  try {
    // Get the project root directory
    const projectRoot = path.join(__dirname, '..');
    
    // Execute npx prisma generate command
    exec('npx prisma generate', { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating Prisma client:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate Prisma client',
          error: error.message,
          stderr: stderr
        });
      }

      console.log('Prisma client generated successfully');
      console.log('Output:', stdout);
      
      return res.status(200).json({
        success: true,
        message: 'Prisma client generated successfully',
        output: stdout
      });
    });
  } catch (error) {
    console.error('Error in generatePrisma controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Prisma client',
      error: error.message
    });
  }
};

// Git pull from main branch
exports.gitPull = async (req, res) => {
  try {
    // Get the project root directory
    const projectRoot = path.join(__dirname, '..');
    
    // Execute git pull origin main command
    exec('git pull origin main', { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error pulling from git:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to pull from git main branch',
          error: error.message,
          stderr: stderr
        });
      }

      console.log('Git pull completed successfully');
      console.log('Output:', stdout);
      
      return res.status(200).json({
        success: true,
        message: 'Git pull from main branch completed successfully',
        output: stdout
      });
    });
  } catch (error) {
    console.error('Error in gitPull controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to pull from git main branch',
      error: error.message
    });
  }
};

