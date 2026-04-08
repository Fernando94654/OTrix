import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(message: string, timeoutMs = 3200): void {
    this.toastr.success(message, 'Success', { timeOut: timeoutMs });
  }

  error(message: string, timeoutMs = 4500): void {
    this.toastr.error(message, 'Error', { timeOut: timeoutMs });
  }

  info(message: string, timeoutMs = 3200): void {
    this.toastr.info(message, 'Info', { timeOut: timeoutMs });
  }
}
