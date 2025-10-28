# Keyboard Navigation Testing Guide
## Tickets Dashboard Accessibility

### Overview
This guide provides step-by-step instructions for testing keyboard navigation on the Tickets Dashboard to ensure WCAG 2.1 Level AA compliance.

---

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Tickets Dashboard page loaded at `/tickets`
- User authenticated and logged in
- No mouse or trackpad usage during testing

---

## Test 1: Basic Tab Navigation

### Objective
Verify that all interactive elements can be reached using the Tab key.

### Steps
1. Load the Tickets Dashboard page
2. Press `Tab` repeatedly to navigate through all interactive elements
3. Observe the focus indicator on each element

### Expected Results
- ✅ Focus moves sequentially through all interactive elements
- ✅ Focus indicator is clearly visible on each element
- ✅ Tab order is logical: navigation → action buttons
- ✅ No elements are skipped
- ✅ No keyboard traps (can always move forward)

### Elements to Verify
1. Navigation links (if present)
2. "Create New Ticket" button
3. "View All Tickets" button
4. Logout button (in navigation)

### Pass Criteria
- All interactive elements receive focus
- Focus order is logical and intuitive
- Focus indicators are clearly visible (3px outline with offset)

---

## Test 2: Reverse Tab Navigation

### Objective
Verify that Shift+Tab navigates backwards through elements.

### Steps
1. Tab to the last interactive element on the page
2. Press `Shift+Tab` repeatedly to navigate backwards
3. Observe focus moving in reverse order

### Expected Results
- ✅ Focus moves backwards through all interactive elements
- ✅ Reverse order matches forward order
- ✅ No elements are skipped
- ✅ Can return to first element

### Pass Criteria
- Reverse navigation works correctly
- All elements accessible in both directions

---

## Test 3: Button Activation with Enter Key

### Objective
Verify that Enter key activates focused buttons.

### Steps
1. Tab to "Create New Ticket" button
2. Press `Enter` key
3. Observe the action (modal should open or navigation occurs)
4. Close modal if opened
5. Tab to "View All Tickets" button
6. Press `Enter` key
7. Observe navigation to ticket list

### Expected Results
- ✅ Enter key activates "Create New Ticket" button
- ✅ Enter key activates "View All Tickets" button
- ✅ Actions execute correctly
- ✅ No page refresh or unexpected behavior

### Pass Criteria
- Both buttons respond to Enter key
- Actions execute as expected

---

## Test 4: Button Activation with Space Key

### Objective
Verify that Space key activates focused buttons.

### Steps
1. Tab to "Create New Ticket" button
2. Press `Space` key
3. Observe the action (modal should open or navigation occurs)
4. Close modal if opened
5. Tab to "View All Tickets" button
6. Press `Space` key
7. Observe navigation to ticket list

### Expected Results
- ✅ Space key activates "Create New Ticket" button
- ✅ Space key activates "View All Tickets" button
- ✅ Page does not scroll when Space is pressed on button
- ✅ Actions execute correctly

### Pass Criteria
- Both buttons respond to Space key
- Space key does not cause page scrolling
- Actions execute as expected

---

## Test 5: Focus Indicator Visibility

### Objective
Verify that focus indicators meet WCAG visibility requirements.

### Steps
1. Tab through all interactive elements
2. For each element, observe the focus indicator
3. Check visibility against different backgrounds

### Expected Results
- ✅ Focus indicator is clearly visible on all elements
- ✅ Outline is at least 2px thick (actual: 3px)
- ✅ Outline has sufficient contrast with background
- ✅ Outline has offset from element (actual: 2px)
- ✅ Additional visual feedback (shadow) present

### Focus Indicator Specifications
```css
.action-btn:focus-visible {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

### Pass Criteria
- Focus indicators visible on all interactive elements
- Indicators meet or exceed WCAG requirements
- Indicators work on all background colors

---

## Test 6: Focus-Visible vs Focus

### Objective
Verify that focus indicators only appear for keyboard navigation, not mouse clicks.

### Steps
1. Click "Create New Ticket" button with mouse
2. Observe whether focus indicator appears
3. Tab to "Create New Ticket" button with keyboard
4. Observe whether focus indicator appears

### Expected Results
- ✅ Mouse click does NOT show focus indicator
- ✅ Keyboard navigation DOES show focus indicator
- ✅ `:focus-visible` pseudo-class working correctly

### Pass Criteria
- Focus indicators only appear for keyboard navigation
- Mouse users don't see unnecessary outlines

---

## Test 7: No Keyboard Traps

### Objective
Verify that users can always navigate away from any element.

### Steps
1. Tab to each interactive element
2. From each element, press Tab to move forward
3. From each element, press Shift+Tab to move backward
4. Verify you can always escape

### Expected Results
- ✅ Can always move forward with Tab
- ✅ Can always move backward with Shift+Tab
- ✅ No elements trap keyboard focus
- ✅ Can navigate to browser address bar with Ctrl+L (or Cmd+L on Mac)

### Pass Criteria
- No keyboard traps detected
- Can always navigate away from any element

---

## Test 8: Modal Focus Management (if applicable)

### Objective
Verify proper focus management when modal opens and closes.

### Steps
1. Tab to "Create New Ticket" button
2. Press Enter to open modal
3. Observe where focus moves
4. Tab through modal elements
5. Close modal (Escape key or close button)
6. Observe where focus returns

### Expected Results
- ✅ Focus moves into modal when opened
- ✅ Focus trapped within modal (Tab cycles through modal elements only)
- ✅ Escape key closes modal
- ✅ Focus returns to trigger button when modal closes
- ✅ Background content not accessible while modal open

### Pass Criteria
- Focus properly managed in modal
- Focus returns to trigger button after close
- No access to background content while modal open

---

## Test 9: Skip Navigation Link (if implemented)

### Objective
Verify skip navigation link allows bypassing repetitive content.

### Steps
1. Load page and immediately press Tab
2. Observe if skip link appears
3. Press Enter on skip link
4. Observe where focus moves

### Expected Results
- ✅ Skip link appears on first Tab press
- ✅ Skip link is clearly visible
- ✅ Activating skip link moves focus to main content
- ✅ Skip link hidden when not focused

### Pass Criteria
- Skip link functional and accessible
- Moves focus to main content area

**Note:** Skip link is recommended but not currently implemented.

---

## Test 10: Logical Tab Order

### Objective
Verify that tab order follows visual layout and logical flow.

### Steps
1. Observe visual layout of page
2. Tab through all elements
3. Compare tab order to visual order

### Expected Tab Order
1. Navigation header elements (if present)
2. "Create New Ticket" button
3. "View All Tickets" button
4. Footer links (if present)

### Expected Results
- ✅ Tab order matches visual order
- ✅ Tab order follows logical reading order (top to bottom, left to right)
- ✅ No unexpected jumps in focus
- ✅ Related elements grouped together

### Pass Criteria
- Tab order is logical and intuitive
- Matches visual layout
- No confusing focus jumps

---

## Test 11: Focus Within Statistics Cards

### Objective
Verify that statistics cards handle focus appropriately.

### Steps
1. Tab through the page
2. Observe whether statistics cards receive focus
3. Check if cards have any interactive elements

### Expected Results
- ✅ Statistics cards do NOT receive focus (they are not interactive)
- ✅ Only interactive elements (buttons) receive focus
- ✅ No unnecessary tab stops

### Pass Criteria
- Non-interactive elements don't receive focus
- Only buttons and links are focusable

---

## Test 12: Keyboard Navigation in Different Browsers

### Objective
Verify keyboard navigation works consistently across browsers.

### Browsers to Test
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Steps
1. Load page in each browser
2. Perform Tests 1-11 in each browser
3. Note any differences or issues

### Expected Results
- ✅ Keyboard navigation works in all browsers
- ✅ Focus indicators visible in all browsers
- ✅ Tab order consistent across browsers
- ✅ Button activation works in all browsers

### Pass Criteria
- Consistent behavior across all major browsers
- No browser-specific issues

---

## Test 13: Keyboard Navigation on Mobile Devices

### Objective
Verify keyboard navigation works with external keyboards on mobile devices.

### Devices to Test
- iOS with external keyboard
- Android with external keyboard

### Steps
1. Connect external keyboard to mobile device
2. Load Tickets Dashboard
3. Perform basic tab navigation tests
4. Test button activation

### Expected Results
- ✅ Tab navigation works on mobile with keyboard
- ✅ Focus indicators visible
- ✅ Buttons activate with Enter/Space

### Pass Criteria
- Keyboard navigation functional on mobile devices
- No mobile-specific issues

---

## Common Issues and Solutions

### Issue: Focus Indicator Not Visible
**Solution:** Check CSS for `:focus-visible` styles. Ensure outline color has sufficient contrast.

### Issue: Tab Order Illogical
**Solution:** Check HTML structure. Avoid using `tabindex` values other than 0 or -1.

### Issue: Keyboard Trap
**Solution:** Ensure all focusable elements can be exited with Tab or Shift+Tab.

### Issue: Space Key Scrolls Page
**Solution:** Ensure `event.preventDefault()` is called in Space key handler for buttons.

### Issue: Focus Lost After Action
**Solution:** Implement proper focus management to return focus to appropriate element.

---

## Reporting Issues

When reporting keyboard navigation issues, include:

1. **Browser and Version:** e.g., Chrome 118.0
2. **Operating System:** e.g., Windows 11, macOS 14
3. **Steps to Reproduce:** Detailed steps
4. **Expected Behavior:** What should happen
5. **Actual Behavior:** What actually happens
6. **Screenshots/Video:** If possible

---

## Success Criteria Summary

### Must Pass (Critical)
- ✅ All interactive elements reachable with Tab
- ✅ Focus indicators clearly visible
- ✅ Enter and Space keys activate buttons
- ✅ No keyboard traps
- ✅ Logical tab order

### Should Pass (Important)
- ✅ Focus-visible works correctly
- ✅ Modal focus management (if applicable)
- ✅ Consistent across browsers

### Nice to Have (Recommended)
- ⚠️ Skip navigation link
- ⚠️ Keyboard shortcuts for common actions

---

## Testing Checklist

Print this checklist and mark each item as you test:

- [ ] Test 1: Basic Tab Navigation
- [ ] Test 2: Reverse Tab Navigation (Shift+Tab)
- [ ] Test 3: Button Activation with Enter Key
- [ ] Test 4: Button Activation with Space Key
- [ ] Test 5: Focus Indicator Visibility
- [ ] Test 6: Focus-Visible vs Focus
- [ ] Test 7: No Keyboard Traps
- [ ] Test 8: Modal Focus Management
- [ ] Test 9: Skip Navigation Link
- [ ] Test 10: Logical Tab Order
- [ ] Test 11: Focus Within Statistics Cards
- [ ] Test 12: Cross-Browser Testing
- [ ] Test 13: Mobile Keyboard Testing

---

## Conclusion

Keyboard navigation is essential for accessibility. Users who cannot use a mouse rely on keyboard navigation to interact with web applications. By following this testing guide, you can ensure that the Tickets Dashboard is fully accessible to keyboard users.

**Target Compliance:** WCAG 2.1 Level AA  
**Key Standards:** 2.1.1 (Keyboard), 2.4.7 (Focus Visible), 2.4.3 (Focus Order)

---

## Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
