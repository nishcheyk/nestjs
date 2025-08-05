"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = require("./user.schema");
const redis_service_1 = require("../common/services/redis.service");
const config_helper_1 = require("../common/helper/config.helper");
class UserService {
    async register(username, password) {
        const existingUser = await user_schema_1.UserModel.findOne({ username });
        if (existingUser)
            throw new Error('Username already exists');
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const newUser = new user_schema_1.UserModel({ username, passwordHash });
        return newUser.save();
    }
    async validateUser(username, password) {
        const user = await user_schema_1.UserModel.findOne({ username });
        if (!user)
            return null; // no user found
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            return null; // password mismatch
        return user;
    }
    async login(user) {
        const userId = user._id.toString();
        const payload = { sub: userId, username: user.username };
        // Use Secret type for secrets to satisfy jwt typings
        const accessSecret = config_helper_1.Config.jwtAccessSecret;
        const refreshSecret = config_helper_1.Config.jwtRefreshSecret;
        // Explicitly type options for jwt.sign
        const accessSignOptions = { expiresIn: config_helper_1.Config.accessTokenExpiry };
        const refreshSignOptions = { expiresIn: config_helper_1.Config.refreshTokenExpiry };
        const accessToken = jsonwebtoken_1.default.sign(payload, accessSecret, accessSignOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, refreshSecret, refreshSignOptions);
        // Store refresh token in Redis with TTL (7 days)
        await redis_service_1.RedisService.set(userId, refreshToken, 7 * 24 * 60 * 60);
        return { accessToken, refreshToken, userId };
    }
    async logout(userId, accessToken) {
        // Decode access token to get expiry time for blacklist TTL
        const decoded = jsonwebtoken_1.default.decode(accessToken);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let ttl = 15 * 60; // default TTL: 15 minutes
        if (decoded?.exp) {
            ttl = decoded.exp - currentTimestamp;
        }
        if (ttl > 0) {
            // Blacklist access token by storing it with TTL
            await redis_service_1.RedisService.set(`bl_${accessToken}`, 'true', ttl);
        }
        // Remove refresh token
        await redis_service_1.RedisService.del(userId);
    }
    async refreshTokens(userId, refreshToken) {
        const storedToken = await redis_service_1.RedisService.get(userId);
        if (!storedToken || storedToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        // Verify refresh token signature and expiry
        try {
            jsonwebtoken_1.default.verify(refreshToken, config_helper_1.Config.jwtRefreshSecret);
        }
        catch {
            throw new Error('Refresh token expired or invalid');
        }
        const user = await user_schema_1.UserModel.findById(userId);
        if (!user)
            throw new Error('User not found');
        // Re-issue tokens
        return this.login(user);
    }
}
exports.UserService = UserService;
