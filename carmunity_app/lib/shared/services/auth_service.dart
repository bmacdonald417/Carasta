import 'package:flutter/foundation.dart';

import '../../app/config/app_config.dart';

/// Session + transport for Carasta APIs. Mutations require a session cookie and/or Bearer token.
///
/// **Provisional:** NextAuth identifies mobile clients via the same JWT as the website when the
/// `Cookie` header is set. Optional `DEV_*` build flags seed a dev session without a login UI.
/// Replace with secure storage + real token exchange when the backend exposes it.
class AuthService extends ChangeNotifier {
  AuthService() {
    _applyBuildTimeProvisionalDefaults();
  }

  String? _userId;
  String? _bearerToken;

  /// Single `Cookie` header value, e.g. `next-auth.session-token=...` (may include multiple
  /// cookies separated by `; ` if needed).
  String? _sessionCookieHeader;

  String? get userId => _userId;
  String? get bearerToken => _bearerToken;

  /// Full `Cookie` request header value, if set.
  String? get sessionCookieHeader => _sessionCookieHeader;

  /// True when the backend can resolve a signed-in user for mutations (cookie or Bearer).
  bool get canPerformMutations =>
      (_bearerToken != null && _bearerToken!.trim().isNotEmpty) ||
      (_sessionCookieHeader != null && _sessionCookieHeader!.trim().isNotEmpty);

  /// True when [userId] is set (needed for following feed + self-follow UX).
  bool get hasUserId => _userId != null && _userId!.trim().isNotEmpty;

  void _applyBuildTimeProvisionalDefaults() {
    final uid = AppConfig.devUserId.trim();
    final tok = AppConfig.devNextAuthSessionToken.trim();
    final name = AppConfig.devSessionCookieName.trim();
    if (uid.isNotEmpty) {
      _userId = uid;
    }
    if (tok.isNotEmpty && name.isNotEmpty) {
      _sessionCookieHeader = '$name=$tok';
    }
  }

  /// Runtime provisional session (e.g. Developer session UI). Not persisted.
  void setProvisionalSession({
    String? userId,
    String? bearerToken,
    String? sessionCookieHeader,
  }) {
    if (userId != null) {
      _userId = userId.trim().isEmpty ? null : userId.trim();
    }
    if (bearerToken != null) {
      _bearerToken = bearerToken.trim().isEmpty ? null : bearerToken.trim();
    }
    if (sessionCookieHeader != null) {
      final t = sessionCookieHeader.trim();
      _sessionCookieHeader = t.isEmpty ? null : t;
    }
    notifyListeners();
  }

  /// Developer session screen — always overwrites user id and cookie from fields.
  void applyDevSessionFields({
    required String userIdInput,
    required String cookieName,
    required String cookieValueInput,
  }) {
    final uid = userIdInput.trim();
    _userId = uid.isEmpty ? null : uid;
    final n = cookieName.trim();
    final v = cookieValueInput.trim();
    _sessionCookieHeader = (n.isEmpty || v.isEmpty) ? null : '$n=$v';
    notifyListeners();
  }

  void setSession({String? userId, String? bearerToken}) {
    if (userId != null) {
      _userId = userId.trim().isEmpty ? null : userId.trim();
    }
    if (bearerToken != null) {
      _bearerToken = bearerToken.trim().isEmpty ? null : bearerToken.trim();
    }
    notifyListeners();
  }

  void clearSession() {
    _userId = null;
    _bearerToken = null;
    _sessionCookieHeader = null;
    notifyListeners();
  }
}
