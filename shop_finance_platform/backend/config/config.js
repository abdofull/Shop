module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'gfrmcvDEDEC49587vjvj$grrj%e!cvmv54-',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    MONGODB_URI: process.env.MONGODB_URI || ' mongodb+srv://abdo:0987654321@cluster0.c5myd.mongodb.net/Accountant-shop?retryWrites=true&w=majority&appName=Cluster0',
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Email configuration
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    
    // File upload configuration
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || './public/uploads',
};

