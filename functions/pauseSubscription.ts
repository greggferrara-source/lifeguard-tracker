import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { action, resume_date } = await req.json();
    // action: "pause" | "resume"

    // Find user's subscription record
    const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
    const sub = subs[0];
    if (!sub?.stripe_subscription_id) {
      return Response.json({ error: "No active subscription found" }, { status: 404 });
    }

    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    if (!stripeSub) return Response.json({ error: "Subscription not found in Stripe" }, { status: 404 });

    if (action === "pause") {
      // Stripe doesn't have a native "pause" — we use pause_collection to stop billing.
      // Proration is handled automatically when they resume (Stripe bills for the partial period used).
      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        pause_collection: {
          behavior: "void", // Voids invoices while paused (no charge, no credit)
          resumes_at: resume_date ? Math.floor(new Date(resume_date).getTime() / 1000) : undefined,
        },
      });

      // Update local record
      await base44.entities.UserSubscription.update(sub.id, {
        status: "paused",
        pause_resumes_at: resume_date || null,
      });

      console.log("Subscription paused for user:", user.email, "resumes:", resume_date || "manually");
      return Response.json({ success: true, status: "paused", resumes_at: resume_date });

    } else if (action === "resume") {
      // Remove pause, Stripe will prorate the next invoice
      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        pause_collection: "",
        proration_behavior: "create_prorations",
      });

      await base44.entities.UserSubscription.update(sub.id, {
        status: "active",
        pause_resumes_at: null,
      });

      console.log("Subscription resumed for user:", user.email);
      return Response.json({ success: true, status: "active" });
    }

    return Response.json({ error: "Invalid action. Use 'pause' or 'resume'" }, { status: 400 });

  } catch (error) {
    console.error("Pause/resume error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});