import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, modules = [], limit = 20 } = body;

    if (!query || query.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const searchQuery = query.toLowerCase();
    const results = [];

    // Search across assets
    if (modules.length === 0 || modules.includes('assets')) {
      const assets = await base44.entities.Asset.list('-updated_date', 100);
      const assetResults = assets
        .filter(a => 
          a.name?.toLowerCase().includes(searchQuery) ||
          a.description?.toLowerCase().includes(searchQuery) ||
          a.asset_id?.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .map(a => ({
          type: 'Asset',
          id: a.id,
          title: a.name,
          subtitle: a.asset_id,
          description: a.description,
          module: 'AssetManagement'
        }));
      results.push(...assetResults);
    }

    // Search across documents
    if (modules.length === 0 || modules.includes('documents')) {
      const docs = await base44.entities.DocumentUpload.list('-uploaded_date', 100);
      const docResults = docs
        .filter(d =>
          d.file_name?.toLowerCase().includes(searchQuery) ||
          d.description?.toLowerCase().includes(searchQuery) ||
          d.tags?.some(t => t.toLowerCase().includes(searchQuery))
        )
        .slice(0, 5)
        .map(d => ({
          type: 'Document',
          id: d.id,
          title: d.file_name,
          subtitle: d.category,
          description: d.description,
          module: 'DocumentManagement'
        }));
      results.push(...docResults);
    }

    // Search across compliance data
    if (modules.length === 0 || modules.includes('compliance')) {
      const assessments = await base44.entities.ComplianceAssessment.list('-completed_date', 100);
      const assessmentResults = assessments
        .filter(a =>
          a.title?.toLowerCase().includes(searchQuery) ||
          a.gap_summary?.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .map(a => ({
          type: 'Compliance Assessment',
          id: a.id,
          title: a.title,
          subtitle: a.assessment_type,
          description: `Overall Score: ${a.overall_score}%`,
          module: 'ComplianceAssessmentManager'
        }));
      results.push(...assessmentResults);
    }

    // Search across pool tests
    if (modules.length === 0 || modules.includes('pool_tests')) {
      const tests = await base44.entities.PoolTestLog.list('-test_date', 100);
      const testResults = tests
        .filter(t =>
          t.location_name?.toLowerCase().includes(searchQuery) ||
          t.notes?.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .map(t => ({
          type: 'Pool Test',
          id: t.id,
          title: t.location_name,
          subtitle: t.test_date,
          description: t.compliance_status,
          module: 'PoolTestReporting'
        }));
      results.push(...testResults);
    }

    // Search across incidents
    if (modules.length === 0 || modules.includes('incidents')) {
      const incidents = await base44.entities.IncidentLog.list('-date', 100);
      const incidentResults = incidents
        .filter(i =>
          i.location_name?.toLowerCase().includes(searchQuery) ||
          i.description?.toLowerCase().includes(searchQuery) ||
          i.patron_name?.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .map(i => ({
          type: 'Incident',
          id: i.id,
          title: `${i.type} - ${i.location_name}`,
          subtitle: i.date,
          description: i.severity,
          module: 'IncidentLogs'
        }));
      results.push(...incidentResults);
    }

    // Limit total results
    const limitedResults = results.slice(0, limit);

    return Response.json({ results: limitedResults, total: results.length });
  } catch (error) {
    console.error('Global search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});