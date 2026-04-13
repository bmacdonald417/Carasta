import 'package:flutter/foundation.dart';

/// Holds session credentials for API calls. Phase 1: in-memory placeholder only.
///
/// Phase 2: persist token securely; integrate with platform auth contract.
class AuthService extends ChangeNotifier {
  String? _userId;
  String? _bearerToken;

  String? get userId => _userId;
  String? get bearerToken => _bearerToken;

  /// Optional: used by `GET /api/explore/feed?tab=following&userId=`.
  void setSession({String? userId, String? bearerToken}) {
    _userId = userId;
    _bearerToken = bearerToken;
    notifyListeners();
  }

  void clearSession() {
    _userId = null;
    _bearerToken = null;
    notifyListeners();
  }
}
