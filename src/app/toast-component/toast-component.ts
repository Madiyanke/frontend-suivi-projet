import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/api.services';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss'
})
export class ToastComponent {
  toastService = inject(ToastService);

  getClasses(type: string) {
    switch (type) {
      case 'success': return 'bg-white border-emerald-100 text-emerald-800';
      case 'error': return 'bg-white border-red-100 text-red-800';
      default: return 'bg-white border-blue-100 text-blue-800';
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '⚠️';
      default: return 'ℹ️';
    }
  }
}