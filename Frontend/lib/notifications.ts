'use client';

import { toast } from 'react-hot-toast';

export function notifySuccess(message: string, timeoutMs = 3200) {
  toast.success(message, { duration: timeoutMs });
}

export function notifyError(message: string, timeoutMs = 4500) {
  toast.error(message, { duration: timeoutMs });
}

export function notifyInfo(message: string, timeoutMs = 3200) {
  toast(message, { duration: timeoutMs });
}
