# 🎓 Lansa Certification Exam System

## Overview
The Lansa Certification Exam System is a comprehensive professional readiness assessment platform that tests candidates across 4 sectors with AI-powered feedback.

## System Architecture

### Database Tables
- **cert_questions**: Question bank with randomized choices
- **cert_sessions**: Active exam sessions
- **cert_answers**: User responses with AI feedback
- **cert_results**: Final scores and category breakdown
- **cert_certifications**: Verified credentials with unique codes

### AI Edge Functions
1. **cert-mirror-feedback**: Real-time reflection after each answer
   - Analyzes how answers sound to employers
   - Provides constructive guidance
   
2. **cert-summary**: Comprehensive performance summary
   - 3-paragraph professional assessment
   - Visible to employers on verification page

## Available Sectors
1. **Office** - Administrative & coordination skills (20 questions loaded ✅)
2. **Service** - Customer-facing & hospitality skills (awaiting questions)
3. **Technical** - Hands-on & technical skills (awaiting questions)
4. **Digital** - Tech & digital skills (awaiting questions)

## Question Categories
Each exam tests 4 pillars of professional readiness:
- **Mindset** (Accountability) - Weight: 1.2x
- **Workplace Intelligence** (Communication) - Weight: 1.0x
- **Performance Habits** (Initiative) - Weight: 1.0x
- **Applied Thinking** (Problem-solving) - Weight: 1.2x

## Exam Flow
1. User selects sector from dashboard
2. System randomly selects 15 questions (3-4 per category)
3. For each question:
   - User selects answer
   - AI generates Mirror Moment feedback
   - Animated transition to next question
4. Final calculation with category weights
5. Badge reveal animation
6. Certification generated if score ≥ 75%

## Scoring Logic
- Each answer has fixed points (0-10)
- Category percentages calculated
- Weighted average applied:
  - Mindset × 1.2
  - Workplace Intelligence × 1.0
  - Performance Habits × 1.0
  - Applied Thinking × 1.2
- **PASS**: Total score ≥ 75%
- **High Performer**: All categories ≥ 80%

## Adding New Questions

### Question Format
```sql
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) 
VALUES (
  'service',  -- sector: office|service|technical|digital
  'mindset',  -- category: mindset|workplace_intelligence|performance_habits|applied_thinking
  'Customer complains about service they received yesterday...',
  '[
    {"id":"a","text":"Apologize and offer immediate solution","points":10},
    {"id":"b","text":"Explain company policy calmly","points":7},
    {"id":"c","text":"Redirect to supervisor","points":4},
    {"id":"d","text":"Defend the previous service","points":2}
  ]'::jsonb,
  'Manager',
  'Tests customer service recovery mindset',
  true
);
```

### Recommended Question Distribution
- **Mindset**: 5-6 questions (weighted 1.2x)
- **Workplace Intelligence**: 4-5 questions
- **Performance Habits**: 4-5 questions
- **Applied Thinking**: 5-6 questions (weighted 1.2x)
- **Total**: 20-25 questions per sector

## Employer Verification
Public verification page at: `/verify/{VERIFICATION_CODE}`

Displays:
- Candidate name and title
- Certification date and level
- Category scores breakdown
- Total score
- AI-generated professional summary

## Routes
- `/certification` - Dashboard with all sectors
- `/certification/office` - Office exam
- `/certification/service` - Service exam
- `/certification/technical` - Technical exam
- `/certification/digital` - Digital exam
- `/certification/result/{resultId}` - Results page
- `/verify/{code}` - Public verification (no auth required)

## Testing the System

### 1. Navigate to Certification Dashboard
```
/certification
```

### 2. Start Office Exam
Click "Start Exam" on Office sector card

### 3. Complete 15 Questions
- Answer each question
- View AI Mirror Moment
- Progress through all 15 questions

### 4. View Results
- See animated badge reveal
- Review category breakdown
- Read AI summary
- Download certificate (if passed)

### 5. Test Verification
Copy verification code and visit:
```
/verify/{your-verification-code}
```

## Customization

### Branding Colors
- Primary: `#1A1F71` (navy)
- Accent: `#F3E744` (yellow)
- Success: Green gradient
- Background: Cream/beige

### Animations
All transitions use GSAP:
- Card entry: `fade-in + slide-up`
- Badge reveal: `elastic bounce + rotation`
- Mirror moment: `shimmer effect`
- Progress bar: `smooth fill`

## Next Steps

### Priority 1: Add More Sectors
Create question banks for:
- Service (hospitality scenarios)
- Technical (hands-on problem-solving)
- Digital (tech literacy & tools)

### Priority 2: Certificate PDF
Implement downloadable PDF certificates with:
- Lansa branding
- QR code linking to verification page
- Category breakdown visual
- Professional seal

### Priority 3: Admin Dashboard
Build admin interface to:
- View all certifications
- Manage question banks
- Review AI feedback quality
- Export analytics

## Technical Notes
- Questions are randomized per session
- Answer order can be randomized per question
- AI prompts are sector/context-aware
- Verification codes are unique and permanent
- RLS policies protect user data

## Support
For questions or issues, contact the Lansa development team.
