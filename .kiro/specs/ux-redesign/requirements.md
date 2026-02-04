# Requirements Document

## Introduction

This document specifies the UX/design improvements for the Cavefulmen speed camera warning app. The app is an Angular 18 PWA that warns drivers about speed cameras in France. The improvements focus on visual hierarchy, dark mode support, better status indicators, improved arrow design, speed warning system, layout improvements, and accessibility enhancements.

## Glossary

- **App**: The Cavefulmen Angular PWA speed camera warning application
- **Speed_Display**: The UI component showing the current driving speed in km/h
- **Distance_Display**: The UI component showing the distance to the nearest speed camera
- **Speed_Limit_Circle**: The circular UI element displaying the speed limit when approaching a camera
- **Directional_Arrow**: The arrow indicator pointing toward the nearest speed camera
- **Wake_Lock**: The screen wake lock feature that prevents the device screen from turning off
- **GPS_Indicator**: The UI component showing GPS signal strength and accuracy
- **Theme_Manager**: The service responsible for managing light/dark mode themes
- **Distance_Threshold**: The 4km distance at which the speed limit becomes visible
- **Speed_Warning_Zone**: The range within 10 km/h of the speed limit (yellow warning)

## Requirements

### Requirement 1: Dark Mode Theme

**User Story:** As a driver, I want to use a dark mode theme, so that I can reduce eye strain during night driving.

#### Acceptance Criteria

1. THE App SHALL provide a dark mode theme with dark backgrounds and light text
2. THE App SHALL persist the user's theme preference in local storage
3. WHEN the app loads, THE Theme_Manager SHALL apply the previously saved theme preference
4. THE App SHALL provide a toggle mechanism to switch between light and dark themes
5. WHEN dark mode is active, THE App SHALL use appropriate contrast ratios meeting WCAG AA standards

### Requirement 2: Color-Coded Distance Warnings

**User Story:** As a driver, I want to see color-coded distance warnings, so that I can quickly assess how close I am to a speed camera.

#### Acceptance Criteria

1. WHEN the distance to a camera is greater than 2km, THE Distance_Display SHALL display in green color
2. WHEN the distance to a camera is between 1km and 2km, THE Distance_Display SHALL display in yellow/amber color
3. WHEN the distance to a camera is less than 1km, THE Distance_Display SHALL display in red color
4. THE Distance_Display SHALL smoothly transition between colors as distance changes
5. WHEN dark mode is active, THE Distance_Display SHALL use appropriately adjusted color values for visibility

### Requirement 3: Prominent Speed Limit Display

**User Story:** As a driver, I want the speed limit to be more prominent when approaching a camera, so that I can clearly see the limit I should not exceed.

#### Acceptance Criteria

1. WHEN the distance to a camera is within the Distance_Threshold, THE Speed_Limit_Circle SHALL be prominently displayed
2. THE Speed_Limit_Circle SHALL use a size and styling that makes it the focal point when visible
3. WHEN the distance decreases below 1km, THE Speed_Limit_Circle SHALL increase in visual prominence through size or animation
4. THE Speed_Limit_Circle SHALL maintain the standard red circle with white background design convention

### Requirement 4: GPS Status Indicator

**User Story:** As a driver, I want to see GPS signal strength, so that I know if my position data is reliable.

#### Acceptance Criteria

1. THE GPS_Indicator SHALL display the current GPS accuracy level using the accuracy value from the browser Geolocation API (already captured as `position.coords.accuracy` in meters)
2. WHEN GPS accuracy is better than 10 meters, THE GPS_Indicator SHALL show a strong signal indicator (3 bars)
3. WHEN GPS accuracy is between 10 and 30 meters, THE GPS_Indicator SHALL show a medium signal indicator (2 bars)
4. WHEN GPS accuracy is worse than 30 meters, THE GPS_Indicator SHALL show a weak signal indicator (1 bar)
5. WHEN no GPS fix is available, THE GPS_Indicator SHALL show a "no signal" state (0 bars or crossed-out icon)

### Requirement 5: Loading State

**User Story:** As a driver, I want to see a loading state while waiting for GPS, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN the app starts and GPS position is not yet available, THE App SHALL display a loading indicator
2. THE App SHALL display a message indicating it is waiting for GPS signal
3. WHEN the first GPS fix is obtained, THE App SHALL transition from loading state to the main display
4. THE loading state SHALL include visual feedback such as a spinner or pulsing animation

### Requirement 6: Wake Lock Status Feedback

**User Story:** As a driver, I want to see when screen lock prevention is active, so that I know my screen will stay on.

#### Acceptance Criteria

1. WHEN wake lock is successfully activated, THE App SHALL display a visual indicator showing the active state
2. WHEN wake lock is not active, THE App SHALL display the button in an inactive/default state
3. WHEN wake lock activation fails, THE App SHALL provide feedback about the failure
4. THE wake lock button SHALL clearly indicate its current state through icon or color change

### Requirement 7: Connection Status Indicator

**User Story:** As a driver, I want to see the app's connection status, so that I know if the app can function properly.

#### Acceptance Criteria

1. THE App SHALL display an indicator showing online/offline status
2. WHEN the app goes offline, THE App SHALL indicate that it is operating in offline mode
3. WHEN the app comes back online, THE App SHALL update the status indicator accordingly

### Requirement 8: Improved Directional Arrow

**User Story:** As a driver, I want a larger and more visible directional arrow, so that I can easily see which direction the camera is in.

#### Acceptance Criteria

1. THE Directional_Arrow SHALL be significantly larger than the current implementation
2. THE Directional_Arrow SHALL use high-contrast colors visible in both light and dark modes
3. WHEN speed is 10 km/h or below, THE Directional_Arrow SHALL remain hidden
4. WHEN speed exceeds 10 km/h, THE Directional_Arrow SHALL become visible
5. THE Directional_Arrow SHALL have smooth rotation transitions when direction changes

### Requirement 9: Arrow Pulsing Animation

**User Story:** As a driver, I want the arrow to pulse when approaching a camera, so that I have additional visual warning.

#### Acceptance Criteria

1. WHEN the distance to a camera is less than 1km and speed exceeds 10 km/h, THE Directional_Arrow SHALL display a pulsing animation
2. THE pulsing animation SHALL be noticeable but not distracting
3. WHEN the distance exceeds 1km, THE Directional_Arrow SHALL stop pulsing and display normally

### Requirement 10: Speed Warning Colors

**User Story:** As a driver, I want my speed display to change color based on the speed limit, so that I can quickly see if I'm speeding.

#### Acceptance Criteria

1. WHEN within the Distance_Threshold and current speed is more than 10 km/h below the limit, THE Speed_Display SHALL display in green
2. WHEN within the Distance_Threshold and current speed is within 10 km/h of the limit, THE Speed_Display SHALL display in yellow/amber
3. WHEN within the Distance_Threshold and current speed exceeds the limit, THE Speed_Display SHALL display in red
4. WHEN outside the Distance_Threshold, THE Speed_Display SHALL display in the default theme color
5. THE color transitions SHALL be smooth and not jarring to the driver

### Requirement 11: Vibration Alerts

**User Story:** As a driver, I want vibration alerts when exceeding the speed limit near a camera, so that I have a tactile warning.

#### Acceptance Criteria

1. WHEN within the Distance_Threshold and current speed exceeds the limit, THE App SHALL trigger a vibration alert using the browser Vibration API (`navigator.vibrate()`)
2. THE vibration alert SHALL use a distinct pattern recognizable as a warning (e.g., 200ms vibrate, 100ms pause, 200ms vibrate)
3. THE App SHALL not vibrate continuously but use a reasonable interval between alerts (minimum 5 seconds between vibration sequences)
4. IF the Vibration API is not available (e.g., iOS Safari does not support it), THEN THE App SHALL gracefully degrade without errors and skip vibration functionality

### Requirement 12: Improved Wake Lock Button

**User Story:** As a driver, I want the wake lock button to be well-styled and show its status, so that I can easily access and understand it.

#### Acceptance Criteria

1. THE wake lock button SHALL be styled consistently with the app's design language
2. THE wake lock button SHALL include an icon indicating its purpose
3. THE wake lock button SHALL be positioned for easy access without obstructing main information
4. THE wake lock button SHALL display its active/inactive state through visual styling

### Requirement 13: App Header

**User Story:** As a driver, I want a subtle header with app branding, so that the app has a polished appearance.

#### Acceptance Criteria

1. THE App SHALL display a header section with the app name or logo
2. THE header SHALL be subtle and not distract from the main driving information
3. THE header SHALL adapt to light and dark themes appropriately
4. THE header SHALL not consume excessive screen space

### Requirement 14: Layout and Visual Grouping

**User Story:** As a driver, I want information to be well-organized and spaced, so that I can quickly scan the display.

#### Acceptance Criteria

1. THE App SHALL group related information visually (speed info, camera info, status indicators)
2. THE App SHALL use consistent spacing between UI elements
3. THE App SHALL prioritize the most important information (distance, speed, limit) with larger display
4. THE App SHALL position status indicators in a non-intrusive location

### Requirement 15: Larger Touch Targets

**User Story:** As a driver, I want larger touch targets, so that I can interact with the app safely while driving.

#### Acceptance Criteria

1. THE App SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels
2. THE App SHALL provide adequate spacing between touch targets to prevent accidental taps

### Requirement 16: Contrast Ratios

**User Story:** As a driver, I want good contrast ratios, so that I can read the display in various lighting conditions.

#### Acceptance Criteria

1. THE App SHALL maintain a minimum contrast ratio of 4.5:1 for normal text
2. THE App SHALL maintain a minimum contrast ratio of 3:1 for large text and UI components
3. WHEN dark mode is active, THE App SHALL maintain equivalent contrast ratios

### Requirement 17: Screen Reader Support

**User Story:** As a user with visual impairments, I want screen reader support, so that I can use the app with assistive technology.

#### Acceptance Criteria

1. THE App SHALL provide aria-labels for all interactive elements
2. THE App SHALL provide aria-live regions for dynamic content updates (distance, speed)
3. THE App SHALL use semantic HTML elements where appropriate
4. THE App SHALL ensure focus management works correctly for keyboard/screen reader navigation
