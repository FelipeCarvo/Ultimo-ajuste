import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class FotoService {
  isMobile(): boolean {
    return !!(window && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform);
  }

  async tirarFoto(): Promise<string | null> {
    if (this.isMobile()) {
      try {
        const foto = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
        });
        return foto.base64String || null;
      } catch (e) {
        return null;
      }
    } else {
      return this.getFotoViaInput();
    }
  }

  async escolherDaGaleria(): Promise<string | null> {
    if (this.isMobile()) {
      try {
        const foto = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
        });
        return foto.base64String || null;
      } catch (e) {
        return null;
      }
    } else {
      return this.getFotoViaInput();
    }
  }

  private getFotoViaInput(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove prefix if present
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }
}
