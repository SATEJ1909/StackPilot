import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { UserModel, AuthProvider } from './auth.model.js';

export const createOAuthState = () => {
    return crypto.randomBytes(24).toString("hex");
};

export const getGithubAuthUrl = (state: string) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID as string,
        scope: "user:email",
        state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const handleGithubCallback = async (code: string) => {
    try {
        if (!code) {
            throw new Error("Missing GitHub code");
        }

        // 1. Exchange code for Access Token
        const tokenRes = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, { headers: { Accept: "application/json" } });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) throw new Error("Failed to obtain access token");

        // 2. Get GitHub User Profile
        const { data: githubUser } = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // 3. Handle Private Email logic
        let email = githubUser.email;
        if (!email) {
            const { data: emails } = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            email = emails.find((e: any) => e.primary && e.verified)?.email;
        }

        if (!email) {
            throw new Error("GitHub account has no verified primary email");
        }

        // 4. Find or Create the User
        let dbUser = await UserModel.findOne({ email });
        if (!dbUser) {
            dbUser = await UserModel.create({
                email,
                name: githubUser.name || githubUser.login,
                avatar: githubUser.avatar_url
            });
        }

        // 5. Link/Update the Auth Provider
        // Identifying by providerId is safer than email for OAuth
        let provider = await AuthProvider.findOne({
            provider: "github",
            providerId: githubUser.id.toString()
        });

        if (!provider) {
            await AuthProvider.create({
                userId: dbUser._id,
                provider: "github",
                providerId: githubUser.id.toString(),
                accessToken: encryptToken(accessToken)
            });
        } else {
            // Optional: Update access token if it changed
            provider.accessToken = encryptToken(accessToken);
            await provider.save();
        }

        // 6. Generate JWT
        const token = jwt.sign(
            { userId: dbUser._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return { user: dbUser, token };

    } catch (error) {
        console.error("GitHub Auth Error:", error);
        throw new Error("Authentication failed");
    }
};

const encryptToken = (token: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }

    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64"),
    ].join(":");
};
