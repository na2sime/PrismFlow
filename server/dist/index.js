"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./config/database");
const setup_1 = require("./middleware/setup");
const setup_2 = __importDefault(require("./routes/setup"));
const auth_1 = __importDefault(require("./routes/auth"));
const twoFactor_1 = __importDefault(require("./routes/twoFactor"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const boards_1 = __importDefault(require("./routes/boards"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
const dataDir = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
database_1.database.getDb();
app.use(setup_1.conditionalSetupCheck);
app.use('/api/setup', setup_2.default);
app.use('/api/auth', auth_1.default);
app.use('/api/auth/2fa', twoFactor_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/boards', boards_1.default);
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../client/build/index.html'));
    });
}
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PrismFlow API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
app.listen(PORT, () => {
    console.log('🚀 PrismFlow server running on port ' + PORT);
    console.log('📊 Dashboard: http://localhost:' + PORT);
    console.log('🔧 API Health: http://localhost:' + PORT + '/api/health');
    console.log('⚙️ Setup: http://localhost:' + PORT + '/api/setup/status');
});
process.on('SIGINT', () => {
    console.log('\n📤 Shutting down gracefully...');
    database_1.database.close();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('📤 Shutting down gracefully...');
    database_1.database.close();
    process.exit(0);
});
//# sourceMappingURL=index.js.map