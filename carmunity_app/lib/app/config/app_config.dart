/// Build-time configuration via `--dart-define`.
///
/// Example:
/// `flutter run --dart-define=API_BASE_URL=https://api.example.com`
class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.environmentLabel,
  });

  /// Base URL of the Carasta web deployment (no trailing slash).
  final String apiBaseUrl;

  /// Dev / staging / prod label for debug banners only.
  final String environmentLabel;

  static AppConfig? _instance;

  static AppConfig get instance {
    final i = _instance;
    if (i == null) {
      throw StateError('AppConfig.init() must be called before runApp');
    }
    return i;
  }

  static void init({
    String apiBaseUrl = const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://localhost:3000',
    ),
    String environmentLabel = const String.fromEnvironment(
      'APP_ENV',
      defaultValue: 'dev',
    ),
  }) {
    _instance = AppConfig(
      apiBaseUrl: apiBaseUrl.replaceAll(RegExp(r'/$'), ''),
      environmentLabel: environmentLabel,
    );
  }

  bool get isProduction => environmentLabel == 'prod';

  // --- Provisional mobile auth (dev / until Bearer issuance ships) ---

  /// Carasta `User.id` for feed `userId` param and self-follow checks.
  static const String devUserId = String.fromEnvironment('DEV_USER_ID', defaultValue: '');

  /// Raw value of the NextAuth session cookie (copy from browser DevTools).
  static const String devNextAuthSessionToken =
      String.fromEnvironment('DEV_NEXTAUTH_SESSION_TOKEN', defaultValue: '');

  /// Cookie name (use `__Secure-next-auth.session-token` on HTTPS if applicable).
  static const String devSessionCookieName = String.fromEnvironment(
    'DEV_SESSION_COOKIE_NAME',
    defaultValue: 'next-auth.session-token',
  );
}
