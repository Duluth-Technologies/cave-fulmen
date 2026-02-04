# Implementation Plan: UX Redesign

## Overview

This implementation plan breaks down the UX redesign into incremental coding tasks. Each task builds on previous work, ensuring no orphaned code. The implementation uses Angular 18 standalone components, CSS custom properties for theming, and fast-check for property-based testing.

## Tasks

- [x] 1. Set up theming infrastructure
  - [x] 1.1 Create ThemeService with toggle and persistence
    - Create `src/app/services/theme.service.ts` with interface and implementation
    - Implement `currentTheme$` observable, `toggleTheme()`, `setTheme()` methods
    - Add localStorage persistence for theme preference
    - Apply theme class to document body on initialization
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Write property tests for ThemeService
    - **Property 1: Theme Persistence Round-Trip**
    - **Property 2: Theme Toggle State Flip**
    - **Validates: Requirements 1.2, 1.3, 1.4**

  - [x] 1.3 Add CSS custom properties for theming
    - Update `src/styles.css` with light and dark theme CSS variables
    - Define color palette, background, text, and status colors
    - Add `.dark` class variant for dark mode values
    - _Requirements: 1.1, 1.5, 16.1, 16.2, 16.3_

- [x] 2. Create utility functions for color and status computations
  - [x] 2.1 Create distance color utility function
    - Create `src/app/utils/color-util.ts`
    - Implement `getDistanceColor(distance: number): 'green' | 'yellow' | 'red'`
    - Green > 2km, Yellow 1-2km, Red < 1km
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Write property test for distance color mapping
    - **Property 3: Distance to Color Mapping**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 2.3 Create GPS signal level utility function
    - Add `getGpsSignalLevel(accuracy: number | null): 0 | 1 | 2 | 3` to color-util.ts
    - 3 bars < 10m, 2 bars 10-30m, 1 bar > 30m, 0 bars null
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.4 Write property test for GPS signal level mapping
    - **Property 4: GPS Accuracy to Signal Level Mapping**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [x] 2.5 Create speed color utility function
    - Add `getSpeedColor(speed: number, limit: number, distance: number): 'default' | 'green' | 'yellow' | 'red'`
    - Default when distance > 4km, otherwise based on speed vs limit
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 2.6 Write property test for speed color mapping
    - **Property 12: Speed Display Color Based on Context**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [x] 3. Checkpoint - Ensure utility functions and theme service work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create VibrationService
  - [x] 4.1 Implement VibrationService
    - Create `src/app/services/vibration.service.ts`
    - Implement `isSupported()`, `vibrate(pattern)`, `vibrateWarning()` methods
    - Add cooldown tracking (5 second minimum between vibrations)
    - Handle missing Vibration API gracefully
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 4.2 Write property test for vibration cooldown
    - **Property 14: Vibration Cooldown Enforcement**
    - **Validates: Requirements 11.3**

- [x] 5. Create status indicator components
  - [x] 5.1 Create StatusIndicatorsComponent
    - Create `src/app/components/status-indicators/status-indicators.component.ts`
    - Display GPS signal bars based on accuracy input
    - Display online/offline indicator
    - Display wake lock active indicator
    - Add aria-labels for accessibility
    - _Requirements: 4.1-4.5, 6.1, 6.2, 7.1-7.3, 17.1_

  - [x] 5.2 Write property tests for status indicators
    - **Property 8: Wake Lock UI State Consistency**
    - **Property 9: Online Status Indicator Consistency**
    - **Validates: Requirements 6.1, 6.2, 7.1, 7.2, 7.3**

- [x] 6. Create display components
  - [x] 6.1 Create DistanceDisplayComponent
    - Create `src/app/components/distance-display/distance-display.component.ts`
    - Display distance with color based on getDistanceColor()
    - Add smooth color transitions via CSS
    - Add aria-live region for screen readers
    - _Requirements: 2.1-2.5, 17.2_

  - [x] 6.2 Create SpeedDisplayComponent
    - Create `src/app/components/speed-display/speed-display.component.ts`
    - Display speed with color based on getSpeedColor()
    - Integrate VibrationService for speed limit alerts
    - Add aria-live region for screen readers
    - _Requirements: 10.1-10.5, 11.1, 17.2_

  - [x] 6.3 Create SpeedLimitCircleComponent
    - Create `src/app/components/speed-limit-circle/speed-limit-circle.component.ts`
    - Display speed limit in red circle when within threshold
    - Add prominence animation when distance < 1km
    - _Requirements: 3.1-3.4_

  - [x] 6.4 Write property tests for display visibility
    - **Property 5: Speed Limit Circle Visibility**
    - **Property 6: Speed Limit Circle Prominence**
    - **Validates: Requirements 3.1, 3.3**

- [x] 7. Create directional arrow component
  - [x] 7.1 Create DirectionalArrowComponent
    - Create `src/app/components/directional-arrow/directional-arrow.component.ts`
    - Larger arrow design with high-contrast colors
    - Visibility based on speed > 10 km/h
    - Smooth rotation transitions
    - Pulsing animation when distance < 1km
    - _Requirements: 8.1-8.5, 9.1-9.3_

  - [x] 7.2 Write property tests for arrow behavior
    - **Property 10: Arrow Visibility Based on Speed**
    - **Property 11: Arrow Pulsing Based on Distance and Speed**
    - **Validates: Requirements 8.3, 8.4, 9.1, 9.3**

- [x] 8. Checkpoint - Ensure all components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create header and wake lock button components
  - [x] 9.1 Create HeaderComponent
    - Create `src/app/components/header/header.component.ts`
    - Display app name/logo subtly
    - Include theme toggle button with sun/moon icon
    - Adapt to light/dark themes
    - _Requirements: 13.1-13.4_

  - [x] 9.2 Create WakeLockButtonComponent
    - Create `src/app/components/wake-lock-button/wake-lock-button.component.ts`
    - Styled button with lock icon
    - Visual state for active/inactive
    - Minimum 44x44px touch target
    - _Requirements: 6.1-6.4, 12.1-12.4, 15.1_

  - [x] 9.3 Write property test for touch target size
    - **Property 15: Touch Target Minimum Size**
    - **Validates: Requirements 15.1**

- [x] 10. Create loading state component
  - [x] 10.1 Create LoadingStateComponent
    - Create `src/app/components/loading-state/loading-state.component.ts`
    - Display spinner/pulsing animation
    - Show "Waiting for GPS signal" message
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 10.2 Write property test for loading state transition
    - **Property 7: GPS Loading State Transition**
    - **Validates: Requirements 5.1, 5.3**

- [x] 11. Refactor AppComponent to integrate all components
  - [x] 11.1 Update AppComponent template
    - Import and use all new standalone components
    - Add HeaderComponent at top
    - Add StatusIndicatorsComponent in non-intrusive position
    - Layout main content with proper visual grouping
    - Show LoadingStateComponent when GPS not available
    - _Requirements: 14.1-14.4_

  - [x] 11.2 Update AppComponent logic
    - Inject ThemeService and expose theme state
    - Track online/offline status via navigator.onLine and events
    - Pass GPS accuracy to StatusIndicatorsComponent
    - Compute arrow visibility and pulsing state
    - Wire up all component inputs and outputs
    - _Requirements: 5.3, 7.1-7.3_

  - [x] 11.3 Update AppComponent styles
    - Apply CSS custom properties throughout
    - Ensure consistent spacing and visual grouping
    - Remove old inline styles, use theme variables
    - _Requirements: 14.1-14.4_

- [x] 12. Add accessibility attributes
  - [x] 12.1 Add aria-labels to all interactive elements
    - Theme toggle button
    - Wake lock button
    - Any other interactive elements
    - _Requirements: 17.1_

  - [x] 12.2 Add aria-live regions to dynamic content
    - Distance display
    - Speed display
    - Status indicators
    - _Requirements: 17.2_

  - [x] 12.3 Ensure semantic HTML structure
    - Use appropriate heading levels
    - Use button elements for buttons
    - Use proper landmark regions
    - _Requirements: 17.3_

  - [x] 12.4 Write property tests for accessibility
    - **Property 16: Aria Labels on Interactive Elements**
    - **Property 17: Aria Live Regions for Dynamic Content**
    - **Validates: Requirements 17.1, 17.2**

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Update WakeLockService to expose state
  - [x] 14.1 Add observable state to WakeLockService
    - Add `isActive$: Observable<boolean>` to track wake lock state
    - Emit state changes on request/release
    - Handle visibility change events
    - _Requirements: 6.1, 6.2_

## Notes

- All tasks are required including property tests for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check library with minimum 100 iterations
- All components are Angular 18 standalone components
