import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

// import chatRoutes from "./routes/chatRoutes.js";
// import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();

// IMPORTANT: For Clerk webhooks, we need raw body
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const payload = req.body.toString();
      const headers = {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      };

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      const evt = wh.verify(payload, headers);

      // Send event to Inngest
      await inngest.send({
        name: `clerk/${evt.type}`,
        data: evt.data,
      });

      res.status(200).json({ message: "Webhook received" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook verification failed" });
    }
  }
);

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
// app.use("/api/chat", chatRoutes);
// app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("Server is running on port:", ENV.PORT)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
