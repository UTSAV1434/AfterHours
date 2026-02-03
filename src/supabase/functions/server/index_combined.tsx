// ============= KV STORE MODULE =============
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const kvClient = () => createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const kv = {
    set: async (key: string, value: any): Promise<void> => {
        const supabase = kvClient();
        const { error } = await supabase.from("kv_store_70a0f2b1").upsert({ key, value });
        if (error) throw new Error(error.message);
    },
    get: async (key: string): Promise<any> => {
        const supabase = kvClient();
        const { data, error } = await supabase.from("kv_store_70a0f2b1").select("value").eq("key", key).maybeSingle();
        if (error) throw new Error(error.message);
        return data?.value;
    },
    del: async (key: string): Promise<void> => {
        const supabase = kvClient();
        const { error } = await supabase.from("kv_store_70a0f2b1").delete().eq("key", key);
        if (error) throw new Error(error.message);
    },
    mdel: async (keys: string[]): Promise<void> => {
        const supabase = kvClient();
        const { error } = await supabase.from("kv_store_70a0f2b1").delete().in("key", keys);
        if (error) throw new Error(error.message);
    },
    getByPrefix: async (prefix: string): Promise<any[]> => {
        const supabase = kvClient();
        const { data, error } = await supabase.from("kv_store_70a0f2b1").select("key, value").like("key", prefix + "%");
        if (error) throw new Error(error.message);
        return data?.map((d) => d.value) ?? [];
    }
};

// ============= APP =============
const app = new Hono();

app.use('*', logger(console.log));

app.use(
    "/*",
    cors({
        origin: "*",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
    }),
);

// Health check
app.get("/make-server-70a0f2b1/health", (c) => c.json({ status: "ok" }));

// Helper functions
function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36) + '_' + password.length;
}

// Create post
app.post("/make-server-70a0f2b1/posts", async (c) => {
    try {
        const body = await c.req.json();
        const { content, category } = body;
        if (!content || content.trim().length === 0) return c.json({ error: "Content is required" }, 400);
        if (content.length > 200) return c.json({ error: "Content must be 200 characters or less" }, 400);

        const postId = generateId();
        const post = {
            id: postId,
            content: content.trim(),
            category: category || "general",
            timestamp: Date.now(),
            reactions: { "💙": 0, "🌙": 0, "✨": 0, "🫂": 0, "💭": 0 }
        };
        await kv.set(`post:${postId}`, post);
        return c.json({ success: true, post });
    } catch (error) {
        return c.json({ error: "Failed to create post", details: String(error) }, 500);
    }
});

// Get posts
app.get("/make-server-70a0f2b1/posts", async (c) => {
    try {
        const allPosts = await kv.getByPrefix("post:");
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentPosts = allPosts
            .filter((post: any) => post.timestamp > oneDayAgo)
            .sort((a: any, b: any) => b.timestamp - a.timestamp);
        return c.json({ posts: recentPosts });
    } catch (error) {
        return c.json({ error: "Failed to fetch posts", details: String(error) }, 500);
    }
});

// React to post
app.post("/make-server-70a0f2b1/posts/:id/react", async (c) => {
    try {
        const postId = c.req.param("id");
        const { emoji, userId, previousEmoji } = await c.req.json();
        if (!emoji || !userId) return c.json({ error: "Emoji and userId are required" }, 400);

        const post = await kv.get(`post:${postId}`);
        if (!post) return c.json({ error: "Post not found" }, 404);
        if (!post.reactions) post.reactions = {};

        if (previousEmoji && previousEmoji !== emoji && post.reactions[previousEmoji] > 0) {
            post.reactions[previousEmoji]--;
            if (post.reactions[previousEmoji] === 0) delete post.reactions[previousEmoji];
        }
        if (previousEmoji === emoji && post.reactions[emoji] > 0) {
            post.reactions[emoji]--;
            if (post.reactions[emoji] === 0) delete post.reactions[emoji];
        } else if (previousEmoji !== emoji) {
            post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
        }
        await kv.set(`post:${postId}`, post);
        return c.json({ success: true, post });
    } catch (error) {
        return c.json({ error: "Failed to add reaction", details: String(error) }, 500);
    }
});

// Get stats
app.get("/make-server-70a0f2b1/stats", async (c) => {
    try {
        const allPosts = await kv.getByPrefix("post:");
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentPosts = allPosts.filter((post: any) => post.timestamp > oneDayAgo);
        let totalReactions = 0, topPost = null, maxReactions = 0;
        recentPosts.forEach((post: any) => {
            if (post.reactions) {
                const count = Object.values(post.reactions).reduce((sum: number, c: any) => sum + c, 0);
                totalReactions += count;
                if (count > maxReactions) { maxReactions = count; topPost = post; }
            }
        });
        return c.json({ totalPosts: recentPosts.length, totalReactions, topPost });
    } catch (error) {
        return c.json({ error: "Failed to fetch stats", details: String(error) }, 500);
    }
});

// Delete post
app.delete("/make-server-70a0f2b1/posts/:id", async (c) => {
    try {
        const postId = c.req.param("id");
        const post = await kv.get(`post:${postId}`);
        if (!post) return c.json({ error: "Post not found" }, 404);
        await kv.del(`post:${postId}`);
        return c.json({ success: true, id: postId });
    } catch (error) {
        return c.json({ error: "Failed to delete post", details: String(error) }, 500);
    }
});

// Register user
app.post("/make-server-70a0f2b1/auth/register", async (c) => {
    try {
        const { username, password } = await c.req.json();
        if (!username || !password) return c.json({ error: "Username and password are required" }, 400);
        if (username.length < 3 || username.length > 20) return c.json({ error: "Username must be 3-20 characters" }, 400);
        if (password.length < 4) return c.json({ error: "Password must be at least 4 characters" }, 400);

        const existingUser = await kv.get(`user:${username.toLowerCase()}`);
        if (existingUser) return c.json({ error: "Username already taken" }, 409);

        const user = {
            username: username.toLowerCase(),
            displayName: username,
            passwordHash: hashPassword(password),
            createdAt: Date.now()
        };
        await kv.set(`user:${username.toLowerCase()}`, user);
        return c.json({ success: true, user: { username: user.username, displayName: user.displayName } });
    } catch (error) {
        return c.json({ error: "Failed to register user", details: String(error) }, 500);
    }
});

// Login user
app.post("/make-server-70a0f2b1/auth/login", async (c) => {
    try {
        const { username, password } = await c.req.json();
        if (!username || !password) return c.json({ error: "Username and password are required" }, 400);

        const user = await kv.get(`user:${username.toLowerCase()}`);
        if (!user || user.passwordHash !== hashPassword(password)) {
            return c.json({ error: "Invalid username or password" }, 401);
        }
        return c.json({ success: true, user: { username: user.username, displayName: user.displayName } });
    } catch (error) {
        return c.json({ error: "Failed to login", details: String(error) }, 500);
    }
});

// Admin auth
app.post("/make-server-70a0f2b1/auth/admin", async (c) => {
    try {
        const { password } = await c.req.json();
        if (password !== "apyx123") return c.json({ error: "Invalid admin password" }, 401);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to authenticate", details: String(error) }, 500);
    }
});

// Get timings
app.get("/make-server-70a0f2b1/config/timings", async (c) => {
    try {
        let timings = await kv.get("config:timings");
        if (!timings) {
            timings = { postingWindowStart: 0, postingWindowEnd: 5, nightModeStart: 0, nightModeEnd: 6 };
        }
        return c.json({ timings });
    } catch (error) {
        return c.json({ error: "Failed to fetch timings", details: String(error) }, 500);
    }
});

// Update timings
app.post("/make-server-70a0f2b1/config/timings", async (c) => {
    try {
        const { postingWindowStart, postingWindowEnd, nightModeStart, nightModeEnd, adminPassword } = await c.req.json();
        if (adminPassword !== "apyx123") return c.json({ error: "Unauthorized" }, 401);

        const validateHour = (h: number) => typeof h === 'number' && h >= 0 && h <= 23;
        if (!validateHour(postingWindowStart) || !validateHour(postingWindowEnd) ||
            !validateHour(nightModeStart) || !validateHour(nightModeEnd)) {
            return c.json({ error: "Invalid timing values. Hours must be 0-23" }, 400);
        }

        const timings = { postingWindowStart, postingWindowEnd, nightModeStart, nightModeEnd };
        await kv.set("config:timings", timings);
        return c.json({ success: true, timings });
    } catch (error) {
        return c.json({ error: "Failed to update timings", details: String(error) }, 500);
    }
});

Deno.serve(app.fetch);
