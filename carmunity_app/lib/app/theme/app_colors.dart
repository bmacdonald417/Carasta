import 'package:flutter/material.dart';

/// Carmunity by Carasta — semantic colors aligned with web `styles/carmunity-tokens.css`.
///
/// Roles:
/// - [accent] / [accentMuted]: primary **brand** copper (nav, links, Carmunity chrome).
/// - [auctionSignal]: performance **red** — bids, live urgency, high bid, countdown stress.
/// - Surfaces: deeper blacks, subtle borders (not gray-heavy).
abstract final class AppColors {
  // --- Surfaces (match web `--background`, `--card`) ---
  static const Color background = Color(0xFF07080C);
  static const Color surface = Color(0xFF10131A);
  static const Color surfaceElevated = Color(0xFF1A1D26);
  static const Color surfaceCard = Color(0xFF141820);

  // --- Borders / dividers ---
  static const Color borderSubtle = Color(0xFF2A3040);
  static const Color divider = Color(0xFF232733);

  // --- Text ---
  static const Color textPrimary = Color(0xFFF4F5F7);
  static const Color textSecondary = Color(0xFF9AA3B5);
  static const Color textTertiary = Color(0xFF6B7287);

  // --- Brand accent — copper #E8A54B (same as web `--primary`) ---
  static const Color accent = Color(0xFFE8A54B);
  static const Color accentMuted = Color(0xFF8F6A2E);

  // --- Auction / bid / live urgency (web `--performance-red` / `signal`) ---
  static const Color auctionSignal = Color(0xFFFF3B5C);

  // --- Semantic ---
  static const Color success = Color(0xFF3DD68C);
  static const Color error = Color(0xFFFF6B6B);
  static const Color focus = Color(0xFF6BA3FF);

  // --- Overlays ---
  static const Color scrim = Color(0xCC000000);
  static const Color imagePlaceholder = Color(0xFF252A36);
}
