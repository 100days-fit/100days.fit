# Decision: Retain Firebase Authentication

## Status
**Approved**

## Date
2025-01-23

## Context
While our FOSS-first strategy (Decision 002) advocates for self-hosted solutions, authentication is a critical security component where managed services provide significant value. Firebase Authentication has been successfully integrated and provides robust, battle-tested authentication infrastructure.

## Decision
**Continue using Firebase Authentication as the primary authentication provider for 100days.fit, treating it as a strategic exception to our FOSS-first approach.**

## Rationale

### Benefits of Firebase Authentication
1. **Proven Reliability**: Battle-tested by millions of applications
2. **Security**: Regular security updates and compliance certifications
3. **Social Logins**: Pre-built integrations with Google, Apple, Facebook, etc.
4. **Development Speed**: Ready-to-use SDKs for all platforms
5. **User Experience**: Smooth authentication flows with minimal friction
6. **Already Integrated**: Existing implementation in both mobile app and website

### Why This is an Exception
- **Authentication is critical infrastructure**: Security breaches here affect entire platform
- **Regulatory compliance**: Firebase handles GDPR, SOC2, and other compliance requirements
- **Maintenance overhead**: Self-hosted auth requires constant security updates
- **User trust**: Users trust Firebase/Google brand for authentication

### Integration with Hasura
Firebase Auth integrates seamlessly with Hasura through JWT tokens:
```javascript
// Firebase custom claims for Hasura
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["user", "admin"],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "{uid}"
  }
}
```

## Alternatives Considered
1. **Supabase Auth (self-hosted)**: Higher operational overhead, security risks
2. **Auth0**: More expensive at scale, similar benefits to Firebase
3. **Custom authentication**: Significant development time, security risks

## Implementation Notes

### Current Implementation
- Mobile app: Firebase SDK integrated in React Native/Expo
- Website: Firebase Web SDK in Next.js
- Backend: Hasura configured for Firebase JWT validation

### No Migration Required
This decision confirms the existing implementation. No migration tasks needed.

## Cost Impact
- **Firebase Auth Free Tier**: 10,000 monthly active users
- **Beyond free tier**: ~$0.006 per monthly active user
- **At 10K users**: ~$60/month (acceptable for critical infrastructure)

## Review Triggers
- Major security incident with Firebase
- Cost exceeding $500/month
- Google deprecating Firebase Auth
- Regulatory changes requiring data sovereignty

## Conclusion
Firebase Authentication remains our authentication solution. This strategic exception to FOSS-first approach is justified by security, reliability, and development velocity benefits.