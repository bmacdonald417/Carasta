import 'package:flutter/material.dart';

import '../../app/theme/app_spacing.dart';

/// Breakpoints for Windows / large layouts — same routes, roomier chrome.
abstract final class Breakpoints {
  static const double compact = 600;
  static const double medium = 900;
  static const double expanded = 1200;
}

bool useWideLayout(BuildContext context) {
  return MediaQuery.sizeOf(context).width >= Breakpoints.medium;
}

bool useRailLayout(BuildContext context) {
  return MediaQuery.sizeOf(context).width >= Breakpoints.medium;
}

/// Horizontal padding that scales up on desktop.
double pageHorizontalPadding(BuildContext context) {
  return useWideLayout(context)
      ? AppSpacing.pageHorizontalWide
      : AppSpacing.pageHorizontalNarrow;
}

/// Constrains feed-style content on ultra-wide windows.
Widget constrainedContent({
  required BuildContext context,
  required Widget child,
}) {
  return Center(
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: AppSpacing.contentMaxWidth),
      child: child,
    ),
  );
}
