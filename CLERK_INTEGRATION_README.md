# Clerk Integration for Lansa

This document outlines the Clerk integration implementation for Lansa, enabling organization-based authentication with advanced role-based security while preserving all existing user data.

## Implementation Status

### ✅ Phase 1: Data Preservation & Migration Setup (COMPLETED)
- Created `user_migration_mapping` table to track migration from Supabase to Clerk
- Added `organizations`, `organization_memberships` tables for multi-tenant support
- Extended role system with organization-level roles (`org_owner`, `org_admin`, etc.)
- Added organization context to existing tables (`user_profiles`, `business_profiles`, `job_listings`)
- Implemented organization-aware RLS policies and security functions

### ✅ Phase 2: Clerk Installation & Frontend Integration (COMPLETED)
- Installed `@clerk/clerk-react` package
- Created `ClerkAuthProvider` for Clerk authentication management
- Built hybrid authentication system supporting both Supabase and Clerk during migration
- Added organization management components (`OrganizationSwitcher`, `CreateOrganizationDialog`)
- Created migration banner component to guide users through the migration process

### 🔄 Phase 3: Setup Instructions (IN PROGRESS)
Follow these steps to complete the Clerk integration:

## Setup Instructions

### 1. Get Clerk Publishable Key
1. Sign up for Clerk at https://go.clerk.com/lovable
2. Create a new application with organization support enabled
3. Copy your Publishable Key from the Clerk Dashboard

### 2. Configure Environment Variables
Add your Clerk Publishable Key to your `.env` file:
```
VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
```

### 3. Configure Clerk Dashboard
In your Clerk Dashboard:

#### Enable Organizations
1. Go to "Organizations" in the sidebar
2. Enable organization support
3. Configure organization roles: owner, admin, manager, member

#### Set up Authentication Methods
1. Configure email/password authentication
2. Enable Google OAuth (optional)
3. Set up any other providers you need

#### Configure Webhooks (Important for Supabase sync)
1. Go to "Webhooks" in Clerk Dashboard
2. Add endpoint: `https://[your-project-id].supabase.co/functions/v1/clerk-user-migration`
3. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
   - `organizationMembership.created`
   - `organizationMembership.updated`

### 4. Configure Supabase for Clerk JWT
In your Supabase Dashboard:

#### Set JWT Settings
1. Go to Authentication > Settings
2. Add Clerk as a third-party auth provider
3. Configure JWT secret and issuer settings

#### Add Clerk Integration
You'll need to configure Supabase to accept Clerk JWTs. This typically involves:
1. Setting up JWT templates in Clerk
2. Configuring Supabase auth settings
3. Updating RLS policies to work with Clerk user IDs

### 5. Test the Integration
1. Set the `VITE_CLERK_PUBLISHABLE_KEY` environment variable
2. Restart your development server
3. Navigate to your app - you should now see Clerk auth components
4. Test organization creation and switching
5. Verify data preservation by checking existing user data

## Migration Process

### For Existing Users
1. Users will see a migration banner when they log in
2. They can initiate migration which creates a mapping entry
3. Users receive instructions to complete Clerk registration
4. Once completed, their data is preserved and linked

### For New Users
1. New users sign up directly through Clerk
2. Organization support is available immediately
3. All new data uses Clerk user IDs

## Organization Features

### Available Organization Roles
- **Owner**: Full control over organization
- **Admin**: Manage members and settings
- **Manager**: Limited administrative access
- **Member**: Basic organization access

### Organization Management
- Create organizations through the UI
- Invite users via email
- Switch between organizations
- Manage member roles and permissions

## Database Schema

### New Tables
- `user_migration_mapping`: Tracks Supabase to Clerk migration
- `organizations`: Organization data with Clerk integration
- `organization_memberships`: User-organization relationships
- Extended `user_roles` with organization context

### Updated Tables
- `user_profiles`: Added `organization_id`, `clerk_user_id`, `migration_status`
- `business_profiles`: Added `organization_id`
- `job_listings`: Added `organization_id`

## Security Considerations

### Data Isolation
- Organizations have isolated data access
- RLS policies enforce organization boundaries
- User data remains secure during migration

### Role-Based Access Control
- Hierarchical permissions within organizations
- Resource-level access control
- Audit logging for organization actions

## Troubleshooting

### Common Issues
1. **Missing CLERK_PUBLISHABLE_KEY**: Ensure environment variable is set
2. **JWT Configuration**: Verify Supabase JWT settings match Clerk
3. **Webhook Errors**: Check Supabase function logs for webhook processing
4. **Migration Issues**: Monitor migration status in `user_migration_mapping` table

### Monitoring
- Check Supabase function logs for migration activities
- Monitor authentication events in Clerk Dashboard
- Review organization membership changes in database

## Next Steps

### Phase 4: Advanced Features (Pending)
- [ ] Multi-tenant data architecture
- [ ] Advanced permission management
- [ ] Organization-specific settings
- [ ] Billing integration per organization
- [ ] Analytics per organization

### Phase 5: Production Deployment
- [ ] Environment-specific configuration
- [ ] Performance optimization
- [ ] Security review
- [ ] User acceptance testing

## Support

For issues related to:
- **Clerk Setup**: Check Clerk documentation or contact Clerk support
- **Supabase Integration**: Review Supabase auth documentation
- **Migration Issues**: Check the migration edge function logs
- **Data Integrity**: Verify RLS policies and permissions

This integration provides a robust foundation for multi-tenant authentication while preserving all existing user data and providing a smooth migration path.