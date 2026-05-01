# Phase 4 Viral Mechanics - Quick Start Guide

## 🚀 Getting Started with Viral Features

### 1. Install Dependencies
```bash
npm install canvas qrcode @types/qrcode
```

### 2. Run Database Migration
```bash
# Apply the referral system schema
psql -U postgres -d admission_master -f supabase/migrations/20240430_referral_system.sql
```

### 3. Test Share Card Generation

#### Via API
```bash
curl -X POST http://localhost:3000/api/share-card \
  -H "Content-Type: application/json" \
  -d '{
    "type": "achievement",
    "analysis": {
      "total": 45,
      "percentile": 85,
      "recommendedPathways": [
        { "name": "個人申請", "description": "適合多元表現突出的學生" }
      ]
    },
    "goal": "考上台大電機系",
    "isAnonymous": true
  }'
```

#### Via Component
```tsx
import EnhancedShareCard from '@/components/EnhancedShareCard';

function MyPage() {
  const [showShare, setShowShare] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowShare(true)}>
        分享我的成就
      </button>
      
      {showShare && (
        <EnhancedShareCard
          analysis={scoreAnalysis}
          studentId="user-123"
          referralCode="ABC123"
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
```

### 4. Implement Referral System

#### Generate Referral Code for New User
```typescript
// In your registration flow
const response = await fetch('/api/referral', {
  method: 'POST',
  body: JSON.stringify({
    studentId: newUserId,
    referredBy: referralCodeFromUrl, // Optional
    referralCode: null // Will be auto-generated
  })
});

const { referralCode } = await response.json();
// Display referralCode to user
```

#### Check Referral Info
```bash
curl http://localhost:3000/api/referral?code=ABC123
```

### 5. Add Social Sharing to Existing Pages

```tsx
import SocialMediaShare from '@/components/SocialMediaShare';

function ResultsPage() {
  const shareData = {
    url: `${window.location.origin}/share/achievement/${userId}`,
    title: '我的升學分析結果',
    description: `我獲得了${total}級分，超越全國${percentile}%的學生！`,
    imageUrl: generatedCardImage
  };
  
  return (
    <div>
      {/* Your existing results display */}
      <SocialMediaShare shareData={shareData} />
    </div>
  );
}
```

### 6. Create Content Pages

The SEO content pages are auto-generated:
- `/guide` - Main guide hub
- `/department/[slug]` - Department information pages
- `/share/achievement/[id]` - Public share pages

### 7. Track Viral Metrics

```typescript
// Access built-in analytics
const metrics = await supabase.rpc('calculate_viral_metrics');

// Track individual shares
await fetch('/api/share-track', {
  method: 'POST',
  body: JSON.stringify({
    studentId: 'user-123',
    shareType: 'achievement',
    platform: 'instagram',
    shareUrl: 'https://...'
  })
});
```

## 📱 Testing Checklist

- [ ] Share card generates correctly with goal text
- [ ] QR codes are scannable and lead to correct pages
- [ ] Anonymous sharing hides user information
- [ ] All social media platforms open correct share dialogs
- [ ] Referral codes are unique and trackable
- [ ] Rewards are distributed correctly
- [ ] School leaderboard updates properly
- [ ] SEO pages are accessible and contain metadata

## 🎯 Priority Features to Implement

1. **High Priority**: 
   - Replace existing ShareCard component with EnhancedShareCard
   - Add social sharing to analysis results page
   - Test referral flow end-to-end

2. **Medium Priority**:
   - Populate department content pages
   - Add sharing prompts after key achievements
   - Implement viral analytics dashboard

3. **Low Priority**:
   - A/B testing different card designs
   - Advanced gamification features
   - Automated sharing suggestions

## 🐛 Common Issues & Solutions

### Issue: Canvas not working on client side
**Solution**: Move share card generation to API route (already implemented)

### Issue: QR code not displaying
**Solution**: Check that qrcode package is installed and API route is accessible

### Issue: Referral rewards not distributing
**Solution**: Ensure database trigger is created and SUPABASE_SERVICE_ROLE_KEY is set

### Issue: Social media links not opening
**Solution**: Check pop-up blocker settings and use direct API calls

## 📊 Monitoring Success

Track these metrics in your analytics dashboard:
1. Share rate per active user
2. Viral coefficient (K-factor)
3. Conversion rate by platform
4. Referral completion rate
5. School leaderboard engagement

Target metrics for successful viral growth:
- **Share Rate**: 20%+ of users share their first analysis
- **Viral Coefficient**: 0.3+ (each user brings 0.3+ new users)
- **Referral Conversion**: 15%+ of shared links convert to signups

---

**Need Help?** Check the full implementation guide in PHASE4_SUMMARY.md
