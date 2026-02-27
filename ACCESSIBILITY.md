# Accessibility (A11y) Guidelines

## Overview

This application follows WCAG 2.1 Level AA standards to ensure accessibility for all users.

## Implemented Features

### ✅ Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order is logical and follows visual flow
- Focus indicators are visible (3px gold outline)
- Skip to content link for quick navigation

### ✅ Screen Reader Support
- Semantic HTML elements (`header`, `nav`, `main`, `section`, `footer`)
- ARIA labels on interactive elements
- Alt text required for all images
- Screen reader only content with `.sr-only` class

### ✅ Visual Accessibility
- Focus visible styles for all interactive elements
- High contrast mode support
- Color contrast meets WCAG AA standards
- Text is resizable up to 200%

### ✅ Motion Accessibility
- Respects `prefers-reduced-motion` setting
- Animations can be disabled
- No auto-playing videos without controls

### ✅ Form Accessibility
- Labels associated with inputs via `htmlFor`/`id`
- Error messages are announced
- Required fields are marked
- Input validation with clear feedback

## Components with A11y Features

### Button Component
- Proper `aria-label` when text is not descriptive
- Disabled state properly communicated
- Touch target minimum 44x44px
- Keyboard activation with Enter/Space

### Toast Notifications
- `role="alert"` for screen reader announcement
- Auto-dismiss with option to disable
- Color is not the only indicator

### Image Component
- Alt text is required
- Decorative images have `alt=""`
- Loading states

### Header Navigation
- Proper heading hierarchy (h1, h2, h3)
- Skip navigation link
- Mobile menu keyboard accessible

## Testing Accessibility

### Manual Testing

1. **Keyboard Navigation**
   ```
   - Tab through all interactive elements
   - Shift+Tab to go backwards
   - Enter/Space to activate buttons
   - Escape to close modals
   ```

2. **Screen Reader Testing**
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (free) or JAWS
   - Test all forms and interactive elements

3. **Color Contrast**
   - Use browser DevTools Lighthouse
   - Check all text against backgrounds
   - Minimum ratio: 4.5:1 for normal text, 3:1 for large text

### Automated Testing

Run accessibility tests:
```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run Lighthouse audit
npx lighthouse http://localhost:4174 --view
```

## Accessibility Checklist

### ✅ Completed
- [x] Skip to content link
- [x] Focus visible styles
- [x] Semantic HTML
- [x] Alt text for images
- [x] Keyboard navigation
- [x] ARIA labels on key elements
- [x] Reduced motion support
- [x] High contrast mode support
- [x] Touch target sizes (44x44px minimum)

### 🔄 In Progress
- [ ] Complete form label associations
- [ ] ARIA live regions for dynamic content
- [ ] Comprehensive ARIA landmark roles
- [ ] Color contrast audit on all pages

### 📋 To Do
- [ ] Screen reader testing on all pages
- [ ] ARIA expanded/collapsed states
- [ ] Focus trap in modals
- [ ] Keyboard shortcuts documentation
- [ ] A11y testing in CI/CD

## Common Patterns

### Form Input with Label
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
    className="..."
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-red-600">
      Please enter a valid email
    </p>
  )}
</div>
```

### Button with Icon
```tsx
<button
  aria-label="Close dialog"
  onClick={handleClose}
>
  <XIcon className="w-5 h-5" aria-hidden="true" />
</button>
```

### Loading State
```tsx
<div role="status" aria-live="polite">
  {loading ? (
    <>
      <span className="sr-only">Loading...</span>
      <Spinner />
    </>
  ) : (
    <Content />
  )}
</div>
```

### Modal Dialog
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
  <button onClick={handleConfirm}>Confirm</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM](https://webaim.org/)
- [Deque axe DevTools](https://www.deque.com/axe/devtools/)

## Reporting A11y Issues

If you find an accessibility issue:
1. Document the issue with screenshots
2. Include steps to reproduce
3. Specify assistive technology used
4. Create a GitHub issue with label `accessibility`

## Continuous Improvement

We are committed to improving accessibility:
- Regular audits with automated tools
- User testing with assistive technologies
- Following WCAG updates
- Community feedback integration
