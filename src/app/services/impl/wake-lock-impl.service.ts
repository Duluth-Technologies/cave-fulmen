import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { WakeLockService } from '../wake-lock.service';

@Injectable({
  providedIn: 'root'
})
export class WakeLockServiceImpl implements WakeLockService {
  private wakeLock: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Requests a wake lock to keep the screen on.
   */
  public async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock active');
        this.wakeLock.addEventListener('release', () => {
          console.log('Screen Wake Lock released');
        });
      } catch (err) {
        console.error('Error requesting wake lock:', err);
      }
    } else {
      this.startVideoHack();
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Releases the wake lock.
   */
  public async releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Screen Wake Lock released');
      } catch (err) {
        console.error('Error releasing wake lock:', err);
      }
    } else {
      this.stopVideoHack();
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handles visibility changes to re-acquire the wake lock if necessary.
   */
  private async handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      await this.requestWakeLock();
    } else {
      await this.releaseWakeLock();
    }
  }

  /**
   * Starts the video hack to keep the screen on.
   */
  private startVideoHack() {
    if (!this.videoElement) {
      this.videoElement = this.renderer.createElement('video');
      this.videoElement!.setAttribute('playsinline', '');
      this.videoElement!.setAttribute('loop', '');
      this.videoElement!.setAttribute('muted', '');
      this.videoElement!.style.display = 'none';

      const sourceElement = this.renderer.createElement('source');
      sourceElement.src = 'assets/blank.mp4';
      sourceElement.type = 'video/mp4';
      this.videoElement!.appendChild(sourceElement);

      document.body.appendChild(this.videoElement!);
    }

    this.videoElement!.play().catch(err => {
      console.error('Error playing video to keep screen awake:', err);
    });
    console.log('Video hack started');
  }

  /**
   * Stops the video hack if it is running.
   */
  private stopVideoHack() {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
    }

    if (this.videoElement) {
      document.body.removeChild(this.videoElement);
      this.videoElement = null;
    }
    console.log('Video hack stopped');
  }
}
