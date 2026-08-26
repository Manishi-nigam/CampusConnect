import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        (click)="toastService.dismiss(toast.id)">
        {{ toast.message }}
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
