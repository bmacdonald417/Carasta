import 'package:flutter/material.dart';

/// Carmunity by Carasta — dark-first palette aligned with a premium automotive social brand.
abstract final class AppColors {
  // Surfaces
  static const Color background = Color(0xFF0A0B0E);
  static const Color surface = Color(0xFF12141A);
  static const Color surfaceElevated = Color(0xFF1A1D26);
  static const Color surfaceCard = Color(0xFF161922);

  // Borders / dividers
  static const Color borderSubtle = Color(0xFF2A2F3C);
  static const Color divider = Color(0xFF232733);

  // Text
  static const Color textPrimary = Color(0xFFF4F5F7);
  static const Color textSecondary = Color(0xFF9AA3B5);
  static const Color textTertiary = Color(0xFF6B7287);

  // Accent — warm copper / performance highlight
  static const Color accent = Color(0xFFE8A54B);
  static const Color accentMuted = Color(0xFF8F6A2E);

  // Semantic
  static const Color success = Color(0xFF3DD68C);
  static const Color error = Color(0xFFFF6B6B);
  static const Color focus = Color(0xFF6BA3FF);

  // Overlays
  static const Color scrim = Color(0xCC000000);
  static const Color imagePlaceholder = Color(0xFF252A36);
}
