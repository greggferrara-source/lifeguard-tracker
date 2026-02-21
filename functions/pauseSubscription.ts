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
      // Switch to offseason pricing ($0.99/month) instead of pausing billing
      const offseasonPriceId = "price_1T36r1Jz3753BrBcoPODSgiL";
      
      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: {
          0: {
            price: offseasonPriceId,
          },
        },
        proration_behavior: "create_prorations",
      });

      // Update local record
      await base44.entities.UserSubscription.update(sub.id, {
        status: "paused",
        pause_resumes_at: resume_date || null,
        plan_name: "offseason",
      });

      console.log("Subscription switched to offseason pricing for user:", user.email, "resumes:", resume_date || "manually");
      return Response.json({ success: true, status: "paused", resumes_at: resume_date });

    } else if (action === "resume") {
      // Restore original plan from metadata or fetch from Stripe
      const originalPlan = stripeSub.metadata?.original_plan || sub.plan_name;
      const priceIdMap = {
        "starter": "price_1T36VDJz3753BrBcNxC9VWyP",
        "pro": "price_1T36XcJz3753BrBckBFQkPAN",
        "enterprise": "price_1T36YxJz3753BrBcqEQlI8jL"
      };
      const originalPriceId = priceIdMap[originalPlan] || priceIdMap["starter"];

      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: {
          0: {
            price: originalPriceId,
          },
        },
        proration_behavior: "create_prorations",
      });

      await base44.entities.UserSubscription.update(sub.id, {
        status: "active",
        pause_resumes_at: null,
        plan_name: originalPlan,
      });

      console.log("Subscription resumed for user:", user.email, "plan:", originalPlan);
      return Response.json({ success: true, status: "active" });
    }

    return Response.json({ error: "Invalid action. Use 'pause' or 'resume'" }, { status: 400 });

  } catch (error) {
    console.error("Pause/resume error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});