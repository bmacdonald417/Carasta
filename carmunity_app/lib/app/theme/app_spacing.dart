/// Spacing scale — use for padding/margins; widen on desktop via [AppSpacing.pageHorizontal].
abstract final class AppSpacing {
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;

  static const double radiusSm = 10;
  static const double radiusMd = 14;
  static const double radiusLg = 20;
  static const double radiusFull = 999;

  /// Default horizontal page padding (narrow).
  static const double pageHorizontalNarrow = md;

  /// Wider gutters on desktop.
  static const double pageHorizontalWide = 32;

  /// Max content width for feed-style layouts on large screens.
  static const double contentMaxWidth = 720;
}
