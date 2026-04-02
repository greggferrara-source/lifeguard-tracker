import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const defaultRoles = [
      {
        role_name: 'admin',
        role_display_name: 'Administrator',
        description: 'Full system access',
        permissions: [
          { resource: 'schedule', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'employees', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'certifications', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'assets', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'pool_tests', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'incidents', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'compliance', actions: ['create', 'read', 'update', 'delete', 'approve'] },
          { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'workflows', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'payroll', actions: ['create', 'read', 'update', 'delete'] }
        ]
      },
      {
        role_name: 'manager',
        role_display_name: 'Facility Manager',
        description: 'Manage staff, schedules, and operations',
        permissions: [
          { resource: 'schedule', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'employees', actions: ['create', 'read', 'update'] },
          { resource: 'certifications', actions: ['read', 'update'] },
          { resource: 'assets', actions: ['create', 'read', 'update'] },
          { resource: 'pool_tests', actions: ['create', 'read', 'update'] },
          { resource: 'incidents', actions: ['create', 'read', 'update'] },
          { resource: 'compliance', actions: ['read', 'update', 'approve'] },
          { resource: 'documents', actions: ['create', 'read', 'update'] },
          { resource: 'reports', actions: ['read', 'create'] },
          { resource: 'workflows', actions: ['read'] }
        ]
      },
      {
        role_name: 'lifeguard',
        role_display_name: 'Lifeguard',
        description: 'Can log incidents and view schedules',
        permissions: [
          { resource: 'schedule', actions: ['read'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'pool_tests', actions: ['create', 'read'] },
          { resource: 'incidents', actions: ['create', 'read'] },
          { resource: 'certifications', actions: ['read'] },
          { resource: 'reports', actions: ['read'] }
        ]
      },
      {
        role_name: 'compliance_officer',
        role_display_name: 'Compliance Officer',
        description: 'Manage compliance assessments and documents',
        permissions: [
          { resource: 'compliance', actions: ['create', 'read', 'update', 'delete', 'approve'] },
          { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'certifications', actions: ['read', 'update'] },
          { resource: 'pool_tests', actions: ['read'] },
          { resource: 'incidents', actions: ['read'] },
          { resource: 'reports', actions: ['read', 'create'] }
        ]
      }
    ];

    const created = [];
    for (const role of defaultRoles) {
      const existing = await base44.asServiceRole.entities.RolePermission.filter({
        role_name: role.role_name
      });

      if (existing.length === 0) {
        const created_role = await base44.asServiceRole.entities.RolePermission.create(role);
        created.push(created_role);
      }
    }

    return Response.json({ created: created.length, message: 'Default roles setup complete' });
  } catch (error) {
    console.error('Role setup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});