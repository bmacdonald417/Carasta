import 'package:dio/dio.dart';

import '../../app/config/app_config.dart';
import '../../shared/services/auth_service.dart';
import 'api_exception.dart';

/// HTTP client for the Carasta platform. No business rules — transport only.
class ApiClient {
  ApiClient({
    required AuthService authService,
    Dio? dio,
  }) : _auth = authService {
    _dio = dio ??
        Dio(
          BaseOptions(
            baseUrl: AppConfig.instance.apiBaseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 30),
            headers: <String, dynamic>{
              Headers.acceptHeader: 'application/json',
              Headers.contentTypeHeader: 'application/json',
            },
          ),
        );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = _auth.bearerToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final AuthService _auth;
  late final Dio _dio;

  Dio get raw => _dio;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  /// Reserved for Phase 2+ mutations (posts, likes, etc.).
  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  ApiException _mapDio(DioException e) {
    final status = e.response?.statusCode;
    final data = e.response?.data;
    var message = e.message ?? 'Request failed';
    if (data is Map && data['error'] is String) {
      message = data['error'] as String;
    }
    return ApiException(message: message, statusCode: status, cause: e);
  }
}
