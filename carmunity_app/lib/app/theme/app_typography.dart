import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Text styles — Material 3 [TextTheme] extensions via [buildTextTheme].
abstract final class AppTypography {
  static TextTheme buildTextTheme() {
    const base = TextStyle(
      color: AppColors.textPrimary,
      letterSpacing: -0.2,
    );

    return TextTheme(
      displaySmall: base.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        height: 1.2,
      ),
      titleLarge: base.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.25,
      ),
      titleMedium: base.copyWith(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        height: 1.3,
      ),
      titleSmall: base.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        height: 1.35,
      ),
      bodyLarge: base.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.45,
      ),
      bodyMedium: base.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.45,
        color: AppColors.textSecondary,
      ),
      bodySmall: base.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.4,
        color: AppColors.textTertiary,
      ),
      labelLarge: base.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
      ),
      labelMedium: base.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        color: AppColors.textSecondary,
      ),
    );
  }
}
