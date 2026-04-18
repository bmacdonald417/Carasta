import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';

/// Carmunity auth transport — no duplicated credential rules; server validates.
class CarmunityAuthRepository {
  CarmunityAuthRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  /// POST /api/auth/mobile/token — credentials users only (same as NextAuth credentials provider).
  Future<({String accessToken, String userId})> exchangeMobileToken({
    required String email,
    required String password,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/api/auth/mobile/token',
      data: <String, dynamic>{
        'email': email.trim(),
        'password': password,
      },
    );
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Sign-in failed',
        statusCode: res.statusCode,
      );
    }
    final token = data['accessToken'];
    final uid = data['userId'];
    if (token is! String || uid is! String) {
      throw ApiException(message: 'Invalid token response', statusCode: res.statusCode);
    }
    return (accessToken: token, userId: uid);
  }
}
