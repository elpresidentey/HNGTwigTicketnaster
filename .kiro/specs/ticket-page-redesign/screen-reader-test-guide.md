# Screen Reader Testing Guide
## Tickets Dashboard Accessibility

### Overview
This guide provides comprehensive instructions for testing the Tickets Dashboard with popular screen readers to ensure compatibility and proper content announcement.

---

## Screen Readers to Test

### Windows
- **NVDA** (NonVisual Desktop Access) - Free, open-source
- **JAWS** (Job Access With Speech) - Commercial, industry standard

### macOS
- **VoiceOver** - Built-in, free

### Mobile
- **VoiceOver** (iOS) - Built-in
- **TalkBack** (Android) - Built-in

---

## NVDA Testing (Windows)

### Installation
1. Download NVDA from [nvaccess.org](https://www.nvaccess.org/)
2. Install and restart computer
3. NVDA will start automatically

### Basic Controls
- **Start/Stop NVDA:** Ctrl + Alt + N
- **Stop Speech:** Ctrl
- **Next Item:** Down Arrow
- **Previous Item:** Up Arrow
- **Next Heading:** H
- **Next Button:** B
- **Next Link:** K
- **Next Landmark:** D
- **Elements List:** NVDA + F7
- **Read All:** NVDA + Down Arrow

**Note:** NVDA key is usually Insert or Caps Lock

### Test Procedure

#### Test 1: Page Structure
1. Load Tickets Dashboard
2. Press NVDA + F7 to open Elements List
3. Select "Headings" tab
4. Verify heading structure

**Expected Announcements:**
```
Heading Level 1: "Welcome back, [Username]!"
Heading Level 2: "Ticket Statistics" (visually hidden)
Heading Level 2: "Quick Actions"
```

**Pass Criteria:**
- ✅ Proper heading hierarchy (h1, h2)
- ✅ All headings announced correctly
- ✅ Visually hidden heading for statistics section

---

#### Test 2: Statistics Cards
1. Navigate to statistics section with Down Arrow
2. Listen to each card announcement

**Expected Announcements:**
```
"Total tickets statistics, region"
"Total Tickets"
"4" (or current count)

"Open tickets statistics, region"
"Open Tickets"
"2" (or current count)

"In progress tickets statistics, region"
"In Progress"
"1" (or current count)

"Closed tickets statistics, region"
"Closed Tickets"
"1" (or current count)
```

**Pass Criteria:**
- ✅ Each card announced as "region"
- ✅ Descriptive aria-label announced
- ✅ Label and value both announced
- ✅ Icons not announced (aria-hidden="true")

---

#### Test 3: Loading States
1. Refresh page
2. Listen to announcements during load

**Expected Announcements:**
```
"Total tickets statistics, region, busy"
"Total Tickets"
"0"
```

**Pass Criteria:**
- ✅ "busy" state announced during loading
- ✅ Loading state removed when data loads
- ✅ Updated values announced

---

#### Test 4: Action Buttons
1. Navigate to Quick Actions section
2. Press B to jump to buttons
3. Listen to button announcements

**Expected Announcements:**
```
"Quick Actions, heading level 2"
"Create a new ticket, button"
"View all tickets, button"
```

**Pass Criteria:**
- ✅ Buttons announced as "button"
- ✅ Descriptive aria-labels announced
- ✅ Button text content announced
- ✅ Icons not announced separately

---

#### Test 5: Button Activation
1. Navigate to "Create New Ticket" button
2. Press Enter or Space
3. Listen for feedback

**Expected Behavior:**
- ✅ Button activates
- ✅ Modal opens or navigation occurs
- ✅ Focus moves appropriately
- ✅ New content announced

---

#### Test 6: Landmarks Navigation
1. Press D to navigate between landmarks
2. Verify landmark announcements

**Expected Landmarks:**
```
"banner, region" (page header)
"region" (statistics section)
"region" (quick actions)
```

**Pass Criteria:**
- ✅ Landmarks properly identified
- ✅ Can navigate between landmarks with D
- ✅ Landmark labels descriptive

---

### NVDA Testing Checklist
- [ ] Page structure and headings
- [ ] Statistics cards announcement
- [ ] Loading states
- [ ] Action buttons
- [ ] Button activation
- [ ] Landmarks navigation
- [ ] Forms mode (if applicable)
- [ ] Table navigation (if applicable)

---

## JAWS Testing (Windows)

### Basic Controls
- **Start JAWS:** Automatically starts
- **Stop Speech:** Ctrl
- **Next Item:** Down Arrow
- **Previous Item:** Up Arrow
- **Next Heading:** H
- **Next Button:** B
- **Next Link:** K
- **Next Region:** R
- **Forms Mode:** Enter (on form element)
- **Virtual Cursor:** Use arrow keys

**Note:** JAWS key is usually Insert

### Test Procedure

Follow the same test procedures as NVDA, but note any differences in announcements.

#### JAWS-Specific Tests

**Test: Virtual Cursor Mode**
1. Navigate page with arrow keys
2. Verify all content accessible

**Test: Forms Mode**
1. Navigate to button
2. Press Enter to activate forms mode
3. Verify button can be activated

**Test: JAWS Cursor**
1. Press JAWS + Semicolon to activate JAWS cursor
2. Navigate page with JAWS cursor
3. Verify all content accessible

### JAWS Testing Checklist
- [ ] Virtual cursor navigation
- [ ] Forms mode activation
- [ ] JAWS cursor navigation
- [ ] All NVDA tests repeated in JAWS

---

## VoiceOver Testing (macOS)

### Activation
- **Start/Stop VoiceOver:** Cmd + F5
- **VoiceOver Training:** Cmd + F8

### Basic Controls
- **VO Key:** Control + Option (hold together)
- **Next Item:** VO + Right Arrow
- **Previous Item:** VO + Left Arrow
- **Activate:** VO + Space
- **Start Reading:** VO + A
- **Stop Reading:** Control
- **Rotor:** VO + U
- **Next Heading:** VO + Cmd + H
- **Web Rotor:** VO + U (then use arrow keys)

### Test Procedure

#### Test 1: Rotor Navigation
1. Press VO + U to open rotor
2. Use Left/Right arrows to select category
3. Test these categories:
   - Headings
   - Landmarks
   - Buttons
   - Form Controls

**Expected Results:**
- ✅ All headings listed
- ✅ All landmarks listed
- ✅ All buttons listed
- ✅ Can navigate to any element from rotor

---

#### Test 2: Statistics Cards
1. Navigate with VO + Right Arrow
2. Listen to card announcements

**Expected Announcements:**
```
"Total tickets statistics, region"
"Total Tickets, text"
"4, text"
```

**Pass Criteria:**
- ✅ Region role announced
- ✅ Aria-label announced
- ✅ Content announced in logical order

---

#### Test 3: Button Interaction
1. Navigate to button with VO + Right Arrow
2. Press VO + Space to activate

**Expected Announcements:**
```
"Create a new ticket, button"
"You are currently on a button"
```

**Pass Criteria:**
- ✅ Button role announced
- ✅ Accessible name announced
- ✅ Button activates with VO + Space

---

#### Test 4: Web Spots
1. Press VO + Cmd + Shift + W to set web spot
2. Navigate away
3. Press VO + Cmd + Shift + W to return

**Pass Criteria:**
- ✅ Can set web spots on important elements
- ✅ Can return to web spots

---

### VoiceOver Testing Checklist
- [ ] Rotor navigation (all categories)
- [ ] Statistics cards announcement
- [ ] Button interaction
- [ ] Web spots functionality
- [ ] Heading navigation
- [ ] Landmark navigation
- [ ] Reading order

---

## VoiceOver Testing (iOS)

### Activation
1. Settings → Accessibility → VoiceOver → On
2. Or triple-click home/side button (if configured)

### Basic Gestures
- **Next Item:** Swipe Right
- **Previous Item:** Swipe Left
- **Activate:** Double Tap
- **Start Reading:** Two-finger swipe down
- **Stop Reading:** Two-finger tap
- **Rotor:** Rotate two fingers
- **Adjust Rotor:** Swipe up/down with one finger

### Test Procedure

#### Test 1: Touch Exploration
1. Touch and drag finger across screen
2. Listen to announcements as you touch elements

**Expected Behavior:**
- ✅ Elements announced as touched
- ✅ All interactive elements discoverable
- ✅ Proper element descriptions

---

#### Test 2: Swipe Navigation
1. Swipe right to move through elements
2. Verify all content accessible

**Expected Order:**
1. Page heading
2. Page description
3. Statistics cards (4 cards)
4. Quick Actions heading
5. Create New Ticket button
6. View All Tickets button

**Pass Criteria:**
- ✅ Logical reading order
- ✅ All elements accessible
- ✅ No unexpected elements

---

#### Test 3: Rotor Navigation
1. Rotate two fingers to open rotor
2. Select "Headings"
3. Swipe up/down to navigate headings

**Pass Criteria:**
- ✅ Can navigate by headings
- ✅ Can navigate by buttons
- ✅ Can navigate by landmarks

---

#### Test 4: Button Activation
1. Swipe to button
2. Double-tap to activate

**Expected Behavior:**
- ✅ Button activates on double-tap
- ✅ Feedback provided
- ✅ Focus moves appropriately

---

#### Test 5: Touch Target Sizes
1. Attempt to activate buttons with single tap
2. Verify touch targets are adequate

**Pass Criteria:**
- ✅ Buttons easy to activate
- ✅ No accidental activations
- ✅ Touch targets at least 44x44 points

---

### iOS VoiceOver Testing Checklist
- [ ] Touch exploration
- [ ] Swipe navigation
- [ ] Rotor navigation
- [ ] Button activation
- [ ] Touch target sizes
- [ ] Reading order
- [ ] Landscape orientation

---

## TalkBack Testing (Android)

### Activation
1. Settings → Accessibility → TalkBack → On
2. Or volume keys shortcut (if configured)

### Basic Gestures
- **Next Item:** Swipe Right
- **Previous Item:** Swipe Left
- **Activate:** Double Tap
- **Start Reading:** Swipe down then right
- **Stop Reading:** Two-finger tap
- **Local Context Menu:** Swipe up then right
- **Global Context Menu:** Swipe down then right
- **Reading Controls:** Swipe left then right

### Test Procedure

#### Test 1: Linear Navigation
1. Swipe right through all elements
2. Verify announcements

**Expected Announcements:**
```
"Welcome back, [Username], heading"
"Here's an overview of your ticket management system"
"Total tickets statistics, region"
"Total Tickets"
"4"
[Continue through all elements]
```

**Pass Criteria:**
- ✅ All elements announced
- ✅ Logical reading order
- ✅ Proper roles announced

---

#### Test 2: Navigation Controls
1. Swipe left then right to open reading controls
2. Select "Headings"
3. Swipe right to navigate by headings

**Pass Criteria:**
- ✅ Can navigate by headings
- ✅ Can navigate by buttons
- ✅ Can navigate by landmarks

---

#### Test 3: Local Context Menu
1. Focus on button
2. Swipe up then right
3. Explore available actions

**Expected Actions:**
- Activate
- Show actions (if available)

**Pass Criteria:**
- ✅ Context menu accessible
- ✅ Actions available
- ✅ Can activate from menu

---

### Android TalkBack Testing Checklist
- [ ] Linear navigation
- [ ] Navigation controls
- [ ] Local context menu
- [ ] Global context menu
- [ ] Button activation
- [ ] Reading order
- [ ] Touch exploration

---

## Common Screen Reader Issues

### Issue: Content Not Announced
**Possible Causes:**
- Missing ARIA labels
- Improper semantic HTML
- Content hidden with `display: none`

**Solution:**
- Add aria-label or aria-labelledby
- Use semantic HTML elements
- Use `sr-only` class for visually hidden content

---

### Issue: Too Much Information Announced
**Possible Causes:**
- Decorative images not hidden
- Redundant ARIA labels
- Unnecessary role attributes

**Solution:**
- Add `aria-hidden="true"` to decorative elements
- Remove redundant labels
- Use native HTML semantics

---

### Issue: Illogical Reading Order
**Possible Causes:**
- CSS positioning changes visual order
- Improper HTML structure
- Incorrect tabindex values

**Solution:**
- Match HTML order to visual order
- Restructure HTML
- Remove or fix tabindex values

---

### Issue: Loading States Not Announced
**Possible Causes:**
- Missing `aria-busy` attribute
- No live region for updates

**Solution:**
- Add `aria-busy="true"` during loading
- Use `aria-live` for dynamic updates
- Remove `aria-busy` when loaded

---

## Expected Announcements Reference

### Page Load
```
"Welcome back, [Username], heading level 1"
"Here's an overview of your ticket management system"
"Ticket Statistics, heading level 2" (visually hidden)
```

### Statistics Card (Loaded)
```
"Total tickets statistics, region"
"Total Tickets"
"4"
```

### Statistics Card (Loading)
```
"Total tickets statistics, region, busy"
"Total Tickets"
"0"
```

### Action Button
```
"Create a new ticket, button"
```

### Quick Actions Section
```
"Quick Actions, heading level 2"
```

---

## Testing Checklist Summary

### All Screen Readers
- [ ] Page structure and headings
- [ ] Statistics cards
- [ ] Loading states
- [ ] Action buttons
- [ ] Button activation
- [ ] Landmarks
- [ ] Reading order
- [ ] ARIA labels
- [ ] Decorative elements hidden

### Desktop Screen Readers (NVDA/JAWS/VoiceOver)
- [ ] Keyboard navigation
- [ ] Heading navigation
- [ ] Landmark navigation
- [ ] Button navigation
- [ ] Forms mode (JAWS)
- [ ] Rotor (VoiceOver)

### Mobile Screen Readers (iOS/Android)
- [ ] Touch exploration
- [ ] Swipe navigation
- [ ] Rotor/Reading controls
- [ ] Double-tap activation
- [ ] Touch target sizes
- [ ] Landscape orientation

---

## Reporting Issues

When reporting screen reader issues, include:

1. **Screen Reader and Version:** e.g., NVDA 2023.2
2. **Browser and Version:** e.g., Chrome 118.0
3. **Operating System:** e.g., Windows 11
4. **Steps to Reproduce:** Detailed steps
5. **Expected Announcement:** What should be announced
6. **Actual Announcement:** What was actually announced
7. **Audio Recording:** If possible

---

## Success Criteria

### Must Pass (Critical)
- ✅ All content accessible with screen reader
- ✅ Proper roles and labels announced
- ✅ Logical reading order
- ✅ Buttons activatable
- ✅ Loading states announced

### Should Pass (Important)
- ✅ Landmarks properly identified
- ✅ Headings navigable
- ✅ Decorative elements hidden
- ✅ Consistent across screen readers

### Nice to Have (Recommended)
- ⚠️ Live regions for dynamic updates
- ⚠️ Descriptive error messages
- ⚠️ Status messages announced

---

## Additional Resources

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Documentation](https://www.freedomscientific.com/training/jaws/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [TalkBack User Guide](https://support.google.com/accessibility/android/answer/6283677)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

---

## Conclusion

Screen reader testing is essential for ensuring that users with visual impairments can access and use the Tickets Dashboard. By following this guide and testing with multiple screen readers, you can ensure comprehensive accessibility compliance.

**Target Compliance:** WCAG 2.1 Level AA  
**Key Standards:** 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value)
