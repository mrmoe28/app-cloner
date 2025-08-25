import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PlatformType, FrameworkType, ComponentType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
  return validTypes.includes(file.type);
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ID generation
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateProjectName(platformType?: PlatformType): string {
  const adjectives = ['Amazing', 'Beautiful', 'Creative', 'Dynamic', 'Elegant', 'Fresh', 'Modern', 'Smart'];
  const nouns = ['App', 'Interface', 'Design', 'Project', 'UI', 'Experience'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const timestamp = Date.now().toString().slice(-4);
  
  const platformPrefix = platformType ? `${platformType.charAt(0).toUpperCase() + platformType.slice(1)} ` : '';
  
  return `${platformPrefix}${adjective} ${noun} ${timestamp}`;
}

// Platform and Framework utilities
export function getPlatformDisplayName(platform: PlatformType): string {
  const displayNames: Record<PlatformType, string> = {
    web: 'Web Application',
    mobile: 'Mobile Application',
    desktop: 'Desktop Application',
    tablet: 'Tablet Application',
  };
  return displayNames[platform] || platform;
}

export function getFrameworkDisplayName(framework: FrameworkType): string {
  const displayNames: Record<FrameworkType, string> = {
    react: 'React',
    'react-native': 'React Native',
    flutter: 'Flutter',
    vue: 'Vue.js',
    angular: 'Angular',
    svelte: 'Svelte',
    'native-ios': 'Native iOS (Swift)',
    'native-android': 'Native Android (Kotlin)',
    xamarin: 'Xamarin',
    ionic: 'Ionic',
    cordova: 'Apache Cordova',
  };
  return displayNames[framework] || framework;
}

export function getCompatibleFrameworks(platform: PlatformType): FrameworkType[] {
  const compatibility: Record<PlatformType, FrameworkType[]> = {
    web: ['react', 'vue', 'angular', 'svelte'],
    mobile: ['react-native', 'flutter', 'native-ios', 'native-android', 'xamarin', 'ionic', 'cordova'],
    desktop: ['react', 'flutter'],
    tablet: ['react-native', 'flutter', 'native-ios', 'native-android'],
  };
  return compatibility[platform] || [];
}

export function getDefaultFramework(platform: PlatformType): FrameworkType {
  const defaults: Record<PlatformType, FrameworkType> = {
    web: 'react',
    mobile: 'react-native',
    desktop: 'react',
    tablet: 'react-native',
  };
  return defaults[platform];
}

// Component utilities
export function getComponentDisplayName(type: ComponentType): string {
  const displayNames: Record<ComponentType, string> = {
    button: 'Button',
    input: 'Text Input',
    text: 'Text',
    image: 'Image',
    card: 'Card',
    navigation: 'Navigation',
    header: 'Header',
    footer: 'Footer',
    sidebar: 'Sidebar',
    modal: 'Modal',
    dropdown: 'Dropdown',
    checkbox: 'Checkbox',
    radio: 'Radio Button',
    switch: 'Toggle Switch',
    slider: 'Slider',
    progress: 'Progress Bar',
    badge: 'Badge',
    avatar: 'Avatar',
    icon: 'Icon',
    divider: 'Divider',
    spacer: 'Spacer',
    container: 'Container',
    grid: 'Grid',
    list: 'List',
    table: 'Table',
    chart: 'Chart',
    form: 'Form',
    tab: 'Tab',
    accordion: 'Accordion',
    carousel: 'Carousel',
    tooltip: 'Tooltip',
    popover: 'Popover',
  };
  return displayNames[type] || type;
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Time utilities
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(targetDate.getTime())) {
    return 'Unknown';
  }
  
  const diff = now.getTime() - targetDate.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Validation utilities
export function validateProjectName(name: string): string | null {
  if (!name.trim()) return 'Project name is required';
  if (name.length < 3) return 'Project name must be at least 3 characters';
  if (name.length > 50) return 'Project name must be less than 50 characters';
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return 'Project name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  return null;
}

// API utilities
export function createApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export function handleApiError(error: any): string {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Download utilities
export function downloadFile(content: string, filename: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadZip(files: { name: string; content: string }[], projectName: string) {
  // This would integrate with a zip library like JSZip
  // For now, we'll download files individually
  files.forEach((file) => {
    downloadFile(file.content, file.name);
  });
}