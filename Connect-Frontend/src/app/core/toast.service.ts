import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = this.nextId++;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.dismiss(id), 3000);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
