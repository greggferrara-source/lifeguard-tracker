import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { error_message, price_id, user_email } = await req.json();

    await base44.asServiceRole.entities.SystemLog.create({
      type: "error",
      category: "checkout",
      message: `Checkout failed: ${error_message}`,
      context: `Price: ${price_id}`,
      user_email: user_email || null,
      resolved: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error logging checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});