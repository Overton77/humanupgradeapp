import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class merger — combines clsx + tailwind-merge so duplicate-utility classes resolve cleanly. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
