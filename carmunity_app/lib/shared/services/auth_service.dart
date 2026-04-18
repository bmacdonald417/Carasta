import 'package:flutter/foundation.dart';

import '../../app/config/app_config.dart';

/// Session + transport for Carasta APIs. Mutations require a session cookie and/or Bearer token.
///
/// **Bearer (Phase 7):** `Authorization: Bearer <jwt>` where `<jwt>` is a NextAuth-compatible token
/// from `POST /api/auth/mobile/token` or the same string as `next-auth.session-token`.
/// **Cookie:** legacy browser-style `Cookie` header still works.
///
/// `signInWithAccessToken` prefers Bearer-only transport (clears pasted cookie) for a cleaner mobile path.
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

  /// Prefer Bearer for mobile — same JWT the web stores in `next-auth.session-token`.
  void signInWithAccessToken({required String accessToken, required String userId}) {
    final t = accessToken.trim();
    final u = userId.trim();
    _bearerToken = t.isEmpty ? null : t;
    _userId = u.isEmpty ? null : u;
    _sessionCookieHeader = null;
    notifyListeners();
  }

  /// Apply a raw JWT as Bearer plus user id (e.g. paste from DevTools). Clears cookie header.
  void applyBearerJwtAndUserId({required String jwt, required String userId}) {
    signInWithAccessToken(accessToken: jwt, userId: userId);
  }
}
