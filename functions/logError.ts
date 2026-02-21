import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, category, message, context, user_email } = await req.json();

    if (!type || !category || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    await base44.asServiceRole.entities.SystemLog.create({
      type,
      category,
      message,
      context: context || null,
      user_email: user_email || null,
      resolved: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error logging failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});