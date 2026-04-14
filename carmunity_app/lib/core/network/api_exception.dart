/// Typed failure from [ApiClient] / repositories.
class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.cause,
  });

  final String message;
  final int? statusCode;
  final Object? cause;

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() =>
      'ApiException($statusCode): $message${cause != null ? ' ($cause)' : ''}';
}
