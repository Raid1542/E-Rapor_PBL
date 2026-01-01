/**
 * Nama File: index.ts
 * Fungsi: Mendefinisikan tipe data terpusat untuk aplikasi E-Rapor,
 *         mencakup tipe pengguna, item menu, dan props komponen layout.
 * Pembuat: Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

import { LucideIcon } from 'lucide-react';

// User Data Type
export interface UserData {
  name: string;
  email: string;
  role: string;
}

// Menu Item Type
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Sidebar Props Type
export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  activeMenu: string;
  setActiveMenu: (value: string) => void;
}

// Header Props Type
export interface HeaderProps {
  user: UserData;
  profileOpen: boolean;
  setProfileOpen: (value: boolean) => void;
  handleLogout: () => void;
}