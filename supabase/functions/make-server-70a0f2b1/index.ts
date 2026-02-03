import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
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

// Health check endpoint
app.get("/make-server-70a0f2b1/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to check if current time is in posting window (12 AM - 5 AM)
function isInPostingWindow(): boolean {
  // Temporarily disabled for testing - always return true
  // const now = new Date();
  // const hours = now.getHours();
  // console.log(`Server time check - Hour: ${hours}, Full time: ${now.toISOString()}`);
  // return hours >= 12 && hours < 18; // 12 PM to 5:59 PM
  return true;
}

// Helper function to generate unique ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new post
app.post("/make-server-70a0f2b1/posts", async (c) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    console.log(`Post attempt - Server time: ${now.toISOString()}, Hour: ${currentHour}`);

    // Time check disabled for testing
    // if (!isInPostingWindow()) {
    //   return c.json({ 
    //     error: "Posting is only allowed between 12 PM and 5 PM",
    //     serverTime: now.toISOString(),
    //     serverHour: currentHour
    //   }, 403);
    // }

    const body = await c.req.json();
    const { content, category } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ error: "Content is required" }, 400);
    }

    if (content.length > 200) {
      return c.json({ error: "Content must be 200 characters or less" }, 400);
    }

    const postId = generateId();
    const post = {
      id: postId,
      content: content.trim(),
      category: category || "general",
      timestamp: Date.now(),
      reactions: {
        "💙": 0,
        "🌙": 0,
        "✨": 0,
        "🫂": 0,
        "💭": 0
      }
    };

    await kv.set(`post:${postId}`, post);

    console.log(`Post created successfully: ${postId}`);
    return c.json({ success: true, post });
  } catch (error) {
    console.log(`Error creating post: ${error}`);
    return c.json({ error: "Failed to create post", details: String(error) }, 500);
  }
});

// Get all posts (only from last 24 hours)
app.get("/make-server-70a0f2b1/posts", async (c) => {
  try {
    const allPosts = await kv.getByPrefix("post:");
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Filter posts from last 24 hours and sort by timestamp (newest first)
    const recentPosts = allPosts
      .filter((post: any) => post.timestamp > oneDayAgo)
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    return c.json({ posts: recentPosts });
  } catch (error) {
    console.log(`Error fetching posts: ${error}`);
    return c.json({ error: "Failed to fetch posts", details: String(error) }, 500);
  }
});

// Add reaction to a post
app.post("/make-server-70a0f2b1/posts/:id/react", async (c) => {
  try {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const { emoji, userId, previousEmoji } = body;

    if (!emoji || !userId) {
      return c.json({ error: "Emoji and userId are required" }, 400);
    }

    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Initialize reactions if not exists
    if (!post.reactions) {
      post.reactions = {};
    }

    // If user previously reacted with a different emoji, decrement that count
    if (previousEmoji && previousEmoji !== emoji) {
      if (post.reactions[previousEmoji] && post.reactions[previousEmoji] > 0) {
        post.reactions[previousEmoji] -= 1;
        if (post.reactions[previousEmoji] === 0) {
          delete post.reactions[previousEmoji];
        }
      }
    }

    // If clicking the same emoji, remove the reaction (toggle off)
    if (previousEmoji === emoji) {
      if (post.reactions[emoji] && post.reactions[emoji] > 0) {
        post.reactions[emoji] -= 1;
        if (post.reactions[emoji] === 0) {
          delete post.reactions[emoji];
        }
      }
    } else {
      // Add new reaction
      post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    }

    await kv.set(`post:${postId}`, post);

    return c.json({ success: true, post });
  } catch (error) {
    console.log(`Error adding reaction: ${error}`);
    return c.json({ error: "Failed to add reaction", details: String(error) }, 500);
  }
});

// Get night stats
app.get("/make-server-70a0f2b1/stats", async (c) => {
  try {
    const allPosts = await kv.getByPrefix("post:");
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentPosts = allPosts.filter((post: any) => post.timestamp > oneDayAgo);

    // Calculate total reactions
    let totalReactions = 0;
    let topPost = null;
    let maxReactions = 0;

    recentPosts.forEach((post: any) => {
      if (post.reactions) {
        const postReactionCount = Object.values(post.reactions).reduce((sum: number, count: any) => sum + count, 0);
        totalReactions += postReactionCount;

        if (postReactionCount > maxReactions) {
          maxReactions = postReactionCount;
          topPost = post;
        }
      }
    });

    return c.json({
      totalPosts: recentPosts.length,
      totalReactions,
      topPost
    });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: "Failed to fetch stats", details: String(error) }, 500);
  }
});

// Clean up old posts (posts older than 24 hours)
app.delete("/make-server-70a0f2b1/cleanup", async (c) => {
  try {
    const allPosts = await kv.getByPrefix("post:");
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const oldPostIds = allPosts
      .filter((post: any) => post.timestamp <= oneDayAgo)
      .map((post: any) => `post:${post.id}`);

    if (oldPostIds.length > 0) {
      await kv.mdel(oldPostIds);
      console.log(`Cleaned up ${oldPostIds.length} old posts`);
    }

    return c.json({ success: true, deletedCount: oldPostIds.length });
  } catch (error) {
    console.log(`Error cleaning up posts: ${error}`);
    return c.json({ error: "Failed to clean up posts", details: String(error) }, 500);
  }
});

// Delete a specific post
app.delete("/make-server-70a0f2b1/posts/:id", async (c) => {
  try {
    const postId = c.req.param("id");
    // Verify post exists first
    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }
    await kv.del(`post:${postId}`);
    console.log(`Deleted post: ${postId}`);
    return c.json({ success: true, id: postId });
  } catch (error) {
    console.log(`Error deleting post: ${error}`);
    return c.json({ error: "Failed to delete post", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);