# Dynamic Charting System Documentation

## 🎯 Overview

The Dynamic Charting System transforms your platform from **hardcoded forms** to **fully customizable, admin-created forms** with automatic analytics generation. Admins can now create any type of form they want, and the system automatically adapts to generate meaningful analytics.

## 🚀 What Changed?

### **Before (Hardcoded System)**
- Forms were fixed in code (Pre-Game, Periods 1-3, etc.)
- Adding new fields required code changes
- Analytics were calculated from specific field names
- Changing the form structure meant updating multiple files

### **After (Dynamic System)**
- ✅ Admins create forms through the UI
- ✅ No code changes needed to add/modify fields
- ✅ Analytics automatically adapt to any field configuration
- ✅ Multiple templates supported (different sports, different forms)
- ✅ Full backward compatibility with existing data

---

## 📋 Key Components

### 1. **Form Templates** (`form_templates` collection)
Define the structure of your forms:
- **Sections**: Organize fields into logical groups (e.g., "Pre-Game", "Period 1")
- **Fields**: Individual questions/inputs with 8 supported types
- **Analytics Config**: Per-field analytics settings
- **Validation**: Required fields, min/max values, patterns

### 2. **Dynamic Charting Entries** (`dynamic_charting_entries` collection)
Student responses to forms:
- Linked to specific template version
- Automatic completion tracking
- Flexible response structure
- Validation against template

### 3. **Dynamic Analytics** (`dynamic_charting_analytics` collection)
Automatically generated insights:
- Field-level analytics (7 types supported)
- Category aggregations
- Trend detection
- Performance scoring

---

## 🎨 Supported Field Types

| Type | Description | Example Use Case | Analytics Types |
|------|-------------|------------------|-----------------|
| **yesno** | Checkbox with optional comments | "Well Rested?" | Percentage, Trend |
| **radio** | Single selection from options | "Skating: poor/improving/good" | Distribution |
| **checkbox** | Multiple selections | "Issues: [focus, positioning]" | Distribution, Count |
| **numeric** | Number input with min/max | "Good Goals: 0-20" | Sum, Average |
| **scale** | Visual slider (e.g., 1-10) | "Challenge Level: 1-10" | Average, Trend |
| **text** | Short text input | "Opponent Name" | Count |
| **textarea** | Long text input | "Additional Notes" | Count |
| **date/time** | Date/time picker | "Session Date" | (Future) |

---

## 📊 Analytics Types

### 1. **Percentage** (for yes/no fields)
- Calculates % of "yes" responses
- Tracks trend (recent vs historical)
- **Example**: "Well Rested: 85%" with trend "improving"

### 2. **Average** (for numeric/scale fields)
- Mean, min, max, median
- Recent vs older comparison
- Improvement rate
- **Example**: "Challenge Level: Avg 7.2/10" trending "stable"

### 3. **Sum** (for numeric fields)
- Total across all entries
- **Example**: "Total Good Goals: 45"

### 4. **Distribution** (for radio/checkbox)
- Frequency of each option
- Most common selection
- **Example**:
  ```
  Skating Performance:
  - in_sync: 60%
  - improving: 30%
  - weak: 10%
  ```

### 5. **Consistency**
- Standard deviation
- Consistency score (0-100)
- **Example**: "Consistency: 78/100" (low variance)

### 6. **Trend**
- Compares recent data to historical
- **Result**: "improving" | "declining" | "stable"

### 7. **Count**
- Simple occurrence counting
- **Example**: "Sessions with comments: 18/20"

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN CREATES TEMPLATE                   │
│  • Define sections (Pre-Game, Periods, etc.)                │
│  • Add fields with types (yesno, radio, numeric, etc.)      │
│  • Configure analytics per field                            │
│  • Set validation rules                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              TEMPLATE SAVED TO DATABASE                      │
│  Collection: form_templates                                 │
│  • Versioning support                                       │
│  • Only one active template per sport                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               STUDENT FILLS FORM                             │
│  • DynamicFormRenderer loads template                       │
│  • Renders appropriate field components                     │
│  • Tracks completion percentage                             │
│  • Validates against template rules                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           RESPONSE SAVED TO DATABASE                         │
│  Collection: dynamic_charting_entries                       │
│  • Links to template ID and version                         │
│  • Flexible JSON structure for responses                    │
│  • Automatic completion calculation                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           ANALYTICS AUTO-GENERATED                           │
│  • Field-level analytics (7 types)                          │
│  • Category aggregations                                    │
│  • Trend detection (recent vs old)                          │
│  • Overall performance score                                │
│  • Top strengths & areas for improvement                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         ANALYTICS SAVED TO DATABASE                          │
│  Collection: dynamic_charting_analytics                     │
│  • Cached for performance                                   │
│  • Recalculated on new entries                              │
│  • Keyed by studentId_templateId                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            DASHBOARDS DISPLAY DATA                           │
│  • Admin dashboard shows all students                       │
│  • Student dashboard shows personal analytics               │
│  • Dynamic visualizations adapt to template                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Getting Started

### Step 1: Initialize Default Template

1. **Navigate to**: `/admin/form-templates`
2. **Click**: "Initialize Templates" button
3. **Wait**: System creates default Hockey Goalie template
4. **Verify**: Template appears in the list with "Active" badge

**What this does:**
- Creates comprehensive Hockey Goalie template (mirrors existing forms)
- Sets it as active for "Hockey" sport
- Makes it available for session creation

### Step 2: View Template Details

1. **Click**: "View Details" on any template
2. **Review**: Sections, fields, analytics configuration
3. **Understand**: How each field will generate analytics

### Step 3: Test Dynamic Form (Coming Soon)

Once student pages are updated:
1. Create new session
2. Fill out the dynamic form
3. See real-time completion percentage
4. Submit and view auto-generated analytics

---

## 🔧 Technical Details

### Services

#### **FormTemplateService** (`src/lib/database/services/form-template.service.ts`)
```typescript
// Create template
await formTemplateService.createTemplate(templateData);

// Get active template for a sport
const template = await formTemplateService.getActiveTemplate('Hockey');

// Activate a template
await formTemplateService.activateTemplate(templateId, 'Hockey');

// Clone template
await formTemplateService.cloneTemplate(templateId, 'New Name', userId);
```

#### **DynamicChartingService** (`src/lib/database/services/dynamic-charting.service.ts`)
```typescript
// Create entry
await dynamicChartingService.createDynamicEntry({
  sessionId,
  studentId,
  formTemplateId,
  formTemplateVersion,
  submittedBy,
  submitterRole: 'student',
  responses: {
    pre_game: {
      well_rested: { value: true, comments: 'Got 8 hours' },
      fueled_for_game: { value: true },
    },
    game_overview: {
      good_goals_p1: { value: 2 },
      bad_goals_p1: { value: 1 },
    },
  },
});

// Get entries for student
const entries = await dynamicChartingService.getDynamicEntriesByStudent(studentId);

// Validate responses
const validation = await dynamicChartingService.validateResponses(templateId, responses);
```

#### **DynamicAnalyticsService** (`src/lib/database/services/dynamic-analytics.service.ts`)
```typescript
// Recalculate analytics
const analytics = await dynamicAnalyticsService.recalculateStudentAnalytics(
  studentId,
  templateId
);

// Get cached analytics
const cached = await dynamicAnalyticsService.getStudentAnalytics(studentId, templateId);

// With date filters
const filtered = await dynamicAnalyticsService.recalculateStudentAnalytics(
  studentId,
  templateId,
  {
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-12-31'),
    includePartialEntries: false,
  }
);
```

### UI Components

#### **DynamicFormRenderer**
```tsx
import { DynamicFormRenderer } from '@/components/charting/DynamicFormRenderer';

<DynamicFormRenderer
  template={template}
  initialValues={existingResponses}
  onChange={(responses) => {
    // Save draft
  }}
  onSectionComplete={(sectionId, data) => {
    // Section completed
  }}
  showSectionNumbers
  collapsibleSections
  highlightRequired
/>
```

#### **Individual Field Components**
```tsx
import { DynamicField } from '@/components/charting/dynamic-fields';

<DynamicField
  field={fieldDefinition}
  value={currentValue}
  onChange={(newValue) => {
    // Handle change
  }}
  error={validationError}
  disabled={isReadOnly}
/>
```

---

## 📈 Example Template Configuration

```typescript
{
  id: 'hockey-goalie-v1',
  name: 'Hockey Goalie Performance Tracker',
  sport: 'Hockey',
  version: 1,
  isActive: true,
  sections: [
    {
      id: 'pre_game',
      title: 'Pre-Game',
      order: 1,
      fields: [
        {
          id: 'well_rested',
          label: 'Well Rested',
          type: 'yesno',
          includeComments: true,
          validation: { required: true },
          analytics: {
            enabled: true,
            type: 'percentage',
            category: 'Game Readiness',
            displayName: 'Rest Adherence',
            targetValue: 80,
          },
        },
        {
          id: 'challenge_level',
          label: 'Expected Challenge',
          type: 'scale',
          validation: { required: true, min: 1, max: 10 },
          analytics: {
            enabled: true,
            type: 'average',
            category: 'Game Difficulty',
          },
        },
      ],
    },
  ],
}
```

---

## 🔄 Migration Path

### Current State (After Phase 2)
✅ Dynamic forms foundation complete
✅ Analytics engine functional
✅ Admin template management UI
❌ Student pages still use legacy forms
❌ Admin dashboard uses hardcoded analytics
❌ No data migration tools yet

### Next Steps

**Phase 3: Student Integration**
- Update session creation to use templates
- Replace legacy form pages with DynamicFormRenderer
- Add backward compatibility layer

**Phase 4: Admin Dashboard Update**
- Update analytics displays to use dynamic data
- Create visualization components
- Support both legacy and dynamic analytics

**Phase 5: Data Migration**
- Build migration tools to convert legacy entries
- Bulk migrate existing data
- Verify data integrity

**Phase 6: Legacy Deprecation**
- Phase out hardcoded forms
- Remove legacy analytics code
- Clean up old collections (optional - can keep for history)

---

## 💡 Use Cases

### Use Case 1: Add New Field to Existing Form

**Problem**: Need to track "Mental Imagery Duration" (0-30 minutes)

**Solution**:
1. Clone active template
2. Add new field to "Pre-Game" section:
   ```typescript
   {
     id: 'mental_imagery_duration',
     label: 'Mental Imagery Duration (minutes)',
     type: 'numeric',
     validation: { required: false, min: 0, max: 30 },
     analytics: {
       enabled: true,
       type: 'average',
       category: 'Mental Preparation',
     },
   }
   ```
3. Activate new template version
4. Analytics automatically include this field!

### Use Case 2: Create Basketball Form

**Problem**: Need charting for basketball players

**Solution**:
1. Create new template for "Basketball"
2. Define sections: "Warm-Up", "Q1-Q4", "Stats"
3. Add relevant fields (shots, rebounds, assists, etc.)
4. Configure analytics per field
5. Activate for Basketball sport
6. System handles everything else!

### Use Case 3: Seasonal Analytics

**Problem**: Compare Fall season vs Spring season

**Solution**:
```typescript
// Fall season analytics
const fallAnalytics = await dynamicAnalyticsService.recalculateStudentAnalytics(
  studentId,
  templateId,
  {
    dateFrom: new Date('2024-09-01'),
    dateTo: new Date('2024-11-30'),
  }
);

// Spring season analytics
const springAnalytics = await dynamicAnalyticsService.recalculateStudentAnalytics(
  studentId,
  templateId,
  {
    dateFrom: new Date('2025-03-01'),
    dateTo: new Date('2025-05-31'),
  }
);

// Compare trends!
```

---

## 🐛 Troubleshooting

### Issue: "Template not found"
**Cause**: Template hasn't been initialized
**Fix**: Go to `/admin/form-templates` and click "Initialize Templates"

### Issue: Analytics not updating
**Cause**: Analytics are cached
**Fix**: Analytics recalculate automatically when new entries are added. To force recalculation:
```typescript
await dynamicAnalyticsService.recalculateStudentAnalytics(studentId, templateId, {
  recalculate: true
});
```

### Issue: Validation errors on submission
**Cause**: Required fields not filled
**Fix**: Check template field validation rules. Use `validateResponses()`:
```typescript
const validation = await dynamicChartingService.validateResponses(templateId, responses);
if (!validation.isValid) {
  console.log(validation.errors);
}
```

---

## 🎓 Best Practices

### Template Design

1. **Group Related Fields**: Use sections logically (Pre-Game, In-Game, Post-Game)
2. **Consistent Naming**: Use clear, descriptive field IDs (e.g., `well_rested` not `wr`)
3. **Analytics Categories**: Group related fields for aggregated insights
4. **Target Values**: Set realistic targets for percentage/average fields
5. **Required Fields**: Only mark truly essential fields as required

### Analytics Configuration

1. **Percentage for Yes/No**: Use `percentage` analytics for binary fields
2. **Average for Scales**: Use `average` for numeric ranges (1-10, goals, etc.)
3. **Distribution for Options**: Use `distribution` for radio/checkbox fields
4. **Higher is Better**: Set `higherIsBetter: false` for negative metrics (goals against, errors)
5. **Categories**: Use 3-6 categories max for cleaner aggregations

### Performance

1. **Cache Analytics**: Don't recalculate on every page load
2. **Partial Submissions**: Allow partial saves for long forms
3. **Lazy Loading**: Load templates only when needed
4. **Index Firestore**: Add indexes for common queries:
   ```
   - studentId + formTemplateId
   - sessionId
   - submittedAt
   ```

---

## 📚 API Reference

### Type Definitions

See `src/types/form-template.ts` for complete type definitions:

- `FormTemplate`: Complete template structure
- `FormSection`: Section with fields
- `FormField`: Individual field configuration
- `FieldType`: Supported field types
- `AnalyticsType`: Supported analytics types
- `FieldAnalyticsResult`: Calculated field analytics
- `CategoryAnalyticsResult`: Aggregated category analytics
- `DynamicStudentAnalytics`: Complete student analytics

---

## 🚀 Future Enhancements

### Short Term
- [ ] Visual template builder/editor UI
- [ ] Template preview mode
- [ ] Bulk template operations
- [ ] Template import/export (JSON)

### Medium Term
- [ ] Conditional field display
- [ ] Formula-based fields (calculated values)
- [ ] Custom validation rules (regex, etc.)
- [ ] Multi-language support

### Long Term
- [ ] AI-powered insights from text fields
- [ ] Predictive analytics (ML models)
- [ ] Custom analytics types (plugins)
- [ ] Real-time collaborative filling
- [ ] Mobile app integration

---

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review code comments in services
3. Check Firestore console for data
4. Review browser console for errors

---

## 🎉 Summary

You now have a **fully dynamic charting platform** that:
- ✅ Allows admins to create custom forms without code changes
- ✅ Automatically generates analytics based on field configuration
- ✅ Supports 8 field types and 7 analytics types
- ✅ Provides intelligent trend detection and performance scoring
- ✅ Maintains backward compatibility with existing system
- ✅ Scales to any sport or use case

**Next**: Integrate with student session pages and update admin dashboards!
