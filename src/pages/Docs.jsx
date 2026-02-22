# LifeGuard Tracker - Updated Documentation

## New Features

### 1. **Shift Preferences Engine**
Employees can now set detailed shift preferences to improve scheduling accuracy and satisfaction.

**Features:**
- Define preferred days of the week
- Set preferred time windows (morning, afternoon, evening)
- Choose preferred locations
- Maximum consecutive shifts limit
- Avoid back-to-back shifts option
- Blackout dates for vacations/events
- Priority weighting for preference matching

**Access:** Team dropdown → Shift Preferences (or ShiftPreferencesManager page)

**How it works:**
1. Employees access their preference settings
2. Admins use the preference matching algorithm when creating schedules
3. System recommends best-fit candidates for open shifts based on preferences

**Backend:** `matchShiftPreferences` function ranks candidates based on location, day, and time preferences

---

### 2. **Incident Trend Reports**
Visual analytics dashboard showing incident patterns and hotspots.

**Features:**
- Incident type distribution (rescue, incident, near miss, first aid, injury)
- Severity breakdown (critical, serious, moderate, minor)
- Hourly hotspots showing when incidents most commonly occur
- Day-of-week patterns
- Time range filtering (7, 30, 90 days)
- Trend indicators (increasing, stable, decreasing)

**Access:** Reports & Admin → Incident Trends

**Benefits:**
- Identify peak incident times to increase staffing
- Understand which incident types are most common
- Monitor trends over time to evaluate improvements
- Prevent incidents at high-risk hours

---

### 3. **Weather Alert System**
Real-time weather monitoring with automated pool closure recommendations.

**Features:**
- Hourly weather checks via Open-Meteo API (free, no API key needed)
- Alert types: Lightning, extreme heat (>95°F), cold, high wind (>25 mph)
- Recommended actions: Monitor, reduce operations, close pool, evacuate
- Temperature, humidity, wind speed tracking
- Critical/warning severity levels
- Multi-location support

**Access:** Reports & Admin → Weather Alerts

**Automation:**
- `checkWeatherAlerts` function runs automatically (configure as scheduled automation)
- Creates WeatherAlert records for each hazard detected
- Severity escalates with conditions (e.g., 100°F = critical heat alert)

**Recommended Setup:**
- Schedule `checkWeatherAlerts` to run every 30 minutes during operating hours

---

### 4. **Staffing Forecast Dashboard**
Predictive analytics to prevent understaffing crises.

**Features:**
- 7-day staffing projections
- Risk level assessment (high, medium, low)
- Required vs. scheduled staff comparison
- Shortage predictions
- Confidence scores (0-100%)
- Historical demand analysis
- Specific action recommendations

**Access:** Reports & Admin → Staffing Forecast

**How it works:**
1. Analyzes historical shift patterns
2. Calculates average staff needed per time slot
3. Compares scheduled staff vs. required staff
4. Generates recommendations (e.g., "hire 2 more staff")

**Backend:** `generateStaffingForecast` function (recommend running daily at 6 AM)

**Benefits:**
- Proactive staffing adjustments
- Reduced last-minute scrambles
- Better resource allocation
- Early warning for busy seasons

---

### 5. **Employee Performance Dashboard**
Comprehensive metrics tracking for all staff.

**Features:**
- Performance rating (1-5 stars)
- Attendance rate percentage
- Total hours worked (lifetime + last 30 days)
- Incident response count
- Average response time
- Certification status (current & expiring)
- Reliability score (0-100)
- Badge/achievement display
- Sortable by rating, hours, attendance

**Access:** Analytics & Team → Employee Performance

**Metrics Tracked:**
- `total_shifts_worked` - Total shifts completed
- `attendance_rate` - Percentage (perfect = 100%)
- `incidents_responded_to` - Number of incidents handled
- `avg_response_time_seconds` - Avg incident response speed
- `certifications_current` - Active certifications
- `certifications_expiring` - Expiring within 30 days
- `reliability_score` - Composite score (0-100)
- `performance_rating` - 1-5 star rating

**Backend:** `updateEmployeePerformance` function (runs daily to refresh metrics)

---

### 6. **Employee Badges & Gamification**
Award badges to motivate staff and recognize achievements.

**Badge Types:**
- ⭐ **Perfect Attendance** - 0 absences in 3 months
- 🚨 **Incident Responder** - 3+ incidents responded
- 👨‍🏫 **Certified Trainer** - Active trainer certification
- 🛡️ **Safety Hero** - 6+ months no violations
- 🤝 **Team Player** - 20+ teamwork commendations
- 💪 **500 Hour Commitment** - 500+ hours worked
- ⚡ **Rapid Responder** - Avg response < 60 seconds
- ✅ **Zero Violations** - 1+ year no safety issues
- 🎓 **Mentor** - Trained 5+ staff
- 🏊 **Lifesaver** - 2+ rescues/saves

**How it works:**
1. System automatically evaluates employees against badge criteria
2. Badges awarded to Performance dashboard
3. Visible on employee profiles as gamification
4. Built-in motivation for compliance and excellence

**Backend:** `awardBadges` function (runs after performance update)

---

### 7. **Patron Profile Management**
Track patron information for better safety and incident prevention.

**Features:**
- Swimming ability levels (non-swimmer, beginner, intermediate, advanced)
- Age group classification
- Medical conditions/special needs
- Emergency contact info
- Incident history per patron
- Visit frequency tracking
- Risk level auto-calculation
- Quick search by name

**Access:** Analytics & Team → Patron Management

**Benefits:**
- Identify high-risk patrons requiring extra attention
- Faster emergency response with pre-populated contacts
- Pattern recognition for repeat incidents
- Liability documentation
- Better lifeguard positioning

**Risk Calculation:**
- Non-swimmers + history of incidents = HIGH risk
- Beginners + no incidents = MEDIUM risk
- Advanced swimmers = LOW risk (unless incident history)

---

## Entities Reference

### New Entities Created:

1. **ShiftPreference** - Employee scheduling preferences
2. **IncidentTrend** - Aggregated incident analytics data
3. **WeatherAlert** - Real-time weather hazards
4. **StaffingForecast** - Predictive staffing needs
5. **EmployeePerformance** - Performance metrics snapshot
6. **EmployeeBadge** - Badge achievements
7. **PatronProfile** - Guest/visitor information

### Updated Entities:
- All existing entities remain unchanged
- New relationships via IDs (employee_id, location_id)

---

## Backend Functions Reference

### Scheduled Tasks (Recommended Setup):

1. **checkWeatherAlerts** - Every 30 minutes
   - Checks current weather for all locations
   - Creates alerts for hazardous conditions
   - Triggers notifications for critical alerts

2. **generateStaffingForecast** - Daily at 6 AM
   - Analyzes historical demand patterns
   - Predicts staffing needs 7 days out
   - Generates recommendations

3. **updateEmployeePerformance** - Daily at 7 AM
   - Calculates performance metrics
   - Updates reliability scores
   - Identifies certification expirations

4. **awardBadges** - Daily at 8 AM
   - Evaluates badge criteria
   - Awards new badges
   - Updates achievement counts

### On-Demand Functions:

1. **matchShiftPreferences** - Called when creating schedules
   - Input: open_shift_id
   - Returns: Top 5 candidate matches with scores

---

## Integration Points

### Weather Data:
- Uses Open-Meteo API (free, no API key required)
- Provides: Temperature, humidity, wind speed, weather codes
- Coverage: Global coordinates support
- Update frequency: Recommended every 30 minutes

### Incident Data:
- Integrates with existing IncidentLog entity
- Auto-trends incident types/severity
- Powers hotspot analysis

### Employee Data:
- Integrates with Employee, Shift, ClockEntry entities
- Calculates hours from shift records
- Tracks certifications from Certification entity

### Payroll:
- Works with existing PayrollEntry entity
- Performance metrics inform pay adjustments
- Hours tracked for accurate payroll

---

## UI Updates

### Navigation Changes:
- **Team dropdown** now includes: Shift Preferences
- **Reports & Admin section** includes:
  - Incident Trends
  - Staffing Forecast
  - Weather Alerts
  - (Existing: Reports, Alerts, Multi-Location Dashboard, etc.)
- **Analytics & Team section** (NEW):
  - Employee Performance
  - Patron Management

---

## Usage Examples

### Scheduling with Preferences:
1. Open a shift slot
2. Use "matchShiftPreferences" function
3. System returns top 5 candidates sorted by preference match
4. Assign shift to best match
5. Employee satisfaction increases

### Preventing Understaffing:
1. View Staffing Forecast dashboard each morning
2. Review "High Risk Days" section
3. If shortage predicted, hire temp or call in staff
4. Track actual vs. predicted to improve algorithm

### Safety Planning:
1. Check Weather Alerts page during weather watch
2. Follow recommended actions (close pool, evacuate, etc.)
3. System logs decision for liability protection
4. Monitor incident trends to adjust staffing at peak hours

### Employee Recognition:
1. View Employee Performance dashboard
2. Badge system automatically awards achievements
3. Share badge wins in team announcements
4. Use badges in performance reviews
5. Tie badge achievements to bonuses

---

## Best Practices

1. **Shift Preferences:** Have employees set preferences quarterly as availability changes
2. **Staffing Forecast:** Review each morning and act on HIGH risk forecasts
3. **Weather Alerts:** Monitor during storm season (configure more frequent checks)
4. **Performance:** Use as reference for annual reviews and promotions
5. **Patron Profiles:** Update incident history immediately after incidents
6. **Badges:** Celebrate badge wins in team announcements for engagement

---

## Troubleshooting

**Weather alerts not appearing:**
- Verify location has latitude/longitude set
- Check scheduled automation is enabled
- Wait up to 30 minutes for next check cycle

**Staffing forecast seems inaccurate:**
- System needs historical data (2+ weeks minimum)
- Add more ClockEntry records for better pattern recognition
- Adjust "required_staff" baseline manually if needed

**Performance metrics not updating:**
- Verify employee has ClockEntry or Shift records
- Check that Certification entity has valid dates
- Allow 24 hours after running updateEmployeePerformance function

**Badges not awarding:**
- Check performance thresholds in `awardBadges` function
- Verify employee meets all criteria
- Wait for daily automation run (or run manually)

---

## Future Enhancement Ideas

- **Mobile app improvements:** Real-time notifications for weather/staffing
- **Automated scheduling:** AI-driven shift assignments based on preferences
- **Payroll integration:** Auto-calculate bonuses based on badges/performance
- **Training integration:** Tie certifications to badge criteria
- **Incident prevention AI:** Predict incident risk and suggest preventive measures
- **Social features:** Leaderboards, team challenges, peer recognition

---

*Last Updated: 2026-02-22*
*Version: 2.0 (Complete Feature Suite)*