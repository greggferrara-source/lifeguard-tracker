import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { vendor_name, description } = await req.json();
    if (!vendor_name && !description) {
      return Response.json({ suggestion: null });
    }

    // Fetch categories and custom rules
    const [categories, rules] = await Promise.all([
      base44.asServiceRole.entities.BillCategory.list('name', 100),
      base44.asServiceRole.entities.CategoryRule.list('name', 100),
    ]);

    const vendorLower = (vendor_name || '').toLowerCase();
    const descLower = (description || '').toLowerCase();

    // Check custom rules first (exact/keyword match)
    for (const rule of rules) {
      if (!rule.enabled) continue;
      const keyword = (rule.keyword || '').toLowerCase();
      if (!keyword) continue;

      const matchVendor = rule.match_field === 'vendor' || rule.match_field === 'both';
      const matchDesc = rule.match_field === 'description' || rule.match_field === 'both';

      const vendorHit = matchVendor && vendorLower.includes(keyword);
      const descHit = matchDesc && descLower.includes(keyword);

      if (vendorHit || descHit) {
        return Response.json({ suggestion: rule.category, source: 'rule', rule_name: rule.name });
      }
    }

    // Use AI to suggest
    const categoryNames = categories.map(c => c.name).join(', ');
    if (!categoryNames) return Response.json({ suggestion: null });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a financial categorization assistant. Given the vendor name and description of a bill, suggest the most appropriate category from the list.

Vendor: "${vendor_name || ''}"
Description: "${description || ''}"
Available categories: ${categoryNames}

Reply with ONLY the category name exactly as it appears in the list, or "none" if none fit.`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" }
        }
      }
    });

    const suggested = result?.category;
    const valid = categories.find(c => c.name.toLowerCase() === (suggested || '').toLowerCase());

    return Response.json({ suggestion: valid ? valid.name : null, source: 'ai' });
  } catch (error) {
    console.error('suggestBillCategory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});