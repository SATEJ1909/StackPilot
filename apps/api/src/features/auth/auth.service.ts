import axios from 'axios';
import jwt from 'jsonwebtoken';
import { UserModel, AuthProvider } from './auth.model.js';

export const getGithubAuthUrl = () => {
    return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
};

export const handleGithubCallback = async (code: string) => {
    try {
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
                accessToken: accessToken
            });
        } else {
            // Optional: Update access token if it changed
            provider.accessToken = accessToken;
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