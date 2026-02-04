import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WakeLockButtonComponent } from './wake-lock-button.component';

describe('WakeLockButtonComponent', () => {
  let component: WakeLockButtonComponent;
  let fixture: ComponentFixture<WakeLockButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WakeLockButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WakeLockButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Visual State', () => {
    /**
     * Validates: Requirements 6.2, 12.4
     * When wake lock is not active, the button should display in inactive/default state
     */
    it('should display inactive state when isActive is false', () => {
      component.isActive = false;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.classList.contains('active')).toBeFalse();
      expect(button.nativeElement.textContent).toContain('Screen Off');
    });

    /**
     * Validates: Requirements 6.1, 12.4
     * When wake lock is active, the button should display a visual indicator showing the active state
     */
    it('should display active state when isActive is true', () => {
      component.isActive = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.classList.contains('active')).toBeTrue();
      expect(button.nativeElement.textContent).toContain('Screen On');
    });

    /**
     * Validates: Requirement 12.2
     * The wake lock button should include an icon indicating its purpose
     */
    it('should display lock icon', () => {
      const icon = fixture.debugElement.query(By.css('.lock-icon'));
      expect(icon).toBeTruthy();
    });

    /**
     * Validates: Requirement 12.2
     * Icon should change based on active/inactive state
     */
    it('should show closed lock icon when active', () => {
      component.isActive = true;
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('.lock-icon'));
      // When active, the path should show a closed lock (full arc)
      const path = svg.nativeElement.querySelector('path');
      expect(path.getAttribute('d')).toContain('M8 11V7a4 4 0 1 1 8 0v4');
    });

    /**
     * Validates: Requirement 12.2
     * Icon should change based on active/inactive state
     */
    it('should show open lock icon when inactive', () => {
      component.isActive = false;
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('.lock-icon'));
      // When inactive, the path should show an open lock (partial arc)
      const path = svg.nativeElement.querySelector('path');
      expect(path.getAttribute('d')).toContain('M8 11V7a4 4 0 0 1 8 0');
      expect(path.getAttribute('d')).not.toContain('v4');
    });
  });

  describe('Touch Target Size', () => {
    /**
     * Validates: Requirement 15.1
     * The app shall ensure all interactive elements have a minimum touch target size of 44x44 pixels
     */
    it('should have minimum 44x44px touch target', () => {
      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      const styles = getComputedStyle(button.nativeElement);
      
      // Check min-width and min-height CSS properties
      expect(styles.minWidth).toBe('44px');
      expect(styles.minHeight).toBe('44px');
    });
  });

  describe('Toggle Event', () => {
    /**
     * Validates: Requirements 6.1-6.4
     * The button should emit a toggle event when clicked
     */
    it('should emit toggle event when clicked', () => {
      const toggleSpy = spyOn(component.toggle, 'emit');
      
      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      button.nativeElement.click();

      expect(toggleSpy).toHaveBeenCalled();
    });

    /**
     * Validates: Requirements 6.1-6.4
     * The button should emit toggle event regardless of current state
     */
    it('should emit toggle event when clicked in active state', () => {
      component.isActive = true;
      fixture.detectChanges();
      
      const toggleSpy = spyOn(component.toggle, 'emit');
      
      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      button.nativeElement.click();

      expect(toggleSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    /**
     * Validates: Requirement 17.1
     * The app shall provide aria-labels for all interactive elements
     */
    it('should have aria-label when inactive', () => {
      component.isActive = false;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe(
        'Enable screen wake lock - keep screen on'
      );
    });

    /**
     * Validates: Requirement 17.1
     * The app shall provide aria-labels for all interactive elements
     */
    it('should have aria-label when active', () => {
      component.isActive = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe(
        'Disable screen wake lock - screen may turn off'
      );
    });

    /**
     * Validates: Requirement 17.1
     * Button should have aria-pressed attribute for toggle state
     */
    it('should have aria-pressed attribute reflecting state', () => {
      component.isActive = false;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');

      component.isActive = true;
      fixture.detectChanges();
      expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    /**
     * Validates: Requirement 17.1
     * Icon should be hidden from screen readers
     */
    it('should hide icon from screen readers', () => {
      const icon = fixture.debugElement.query(By.css('.lock-icon'));
      expect(icon.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    /**
     * Validates: Requirement 17.3
     * The app shall use semantic HTML elements where appropriate
     */
    it('should use button element', () => {
      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(button.nativeElement.getAttribute('type')).toBe('button');
    });
  });

  describe('Styling', () => {
    /**
     * Validates: Requirement 12.1
     * The wake lock button shall be styled consistently with the app's design language
     */
    it('should use CSS custom properties for theming', () => {
      const button = fixture.debugElement.query(By.css('.wake-lock-button'));
      const styles = getComputedStyle(button.nativeElement);
      
      // Button should have styling applied (not default browser styles)
      expect(styles.borderRadius).toBe('8px');
      expect(styles.cursor).toBe('pointer');
    });
  });
});
