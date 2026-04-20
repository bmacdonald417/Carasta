import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../shared/dto/carmunity_me_dto.dart';
import '../../../../shared/dto/demo_account_dto.dart';
import '../../../../shared/dto/post_detail_dto.dart';
import '../../../../shared/dto/post_summary.dart';

/// Carmunity feed + engagement — Carasta JSON APIs only (no duplicated rules).
class CarmunityRepository {
  CarmunityRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  static const _feedPath = '/api/explore/feed';

  /// Trending: server sorts by like count (see Next.js route).
  Future<List<PostSummary>> fetchTrending({String? userIdForLiked}) async {
    final query = <String, dynamic>{
      'tab': 'trending',
      if (userIdForLiked != null) 'userId': userIdForLiked,
    };
    return _fetchPosts(query);
  }

  /// Following feed — requires platform user id (same as web `userId` query param).
  Future<List<PostSummary>> fetchFollowing({required String userId}) async {
    final query = <String, dynamic>{
      'tab': 'following',
      'userId': userId,
    };
    return _fetchPosts(query);
  }

  /// Latest feed — chronological `createdAt` desc (same as web `tab=latest`).
  Future<List<PostSummary>> fetchLatest({String? userIdForLiked}) async {
    final query = <String, dynamic>{
      'tab': 'latest',
      if (userIdForLiked != null) 'userId': userIdForLiked,
    };
    return _fetchPosts(query);
  }

  /// GET /api/user/carmunity-onboarding
  Future<({bool completed, Map<String, dynamic>? prefs})> fetchCarmunityOnboarding() async {
    final res = await _client.raw.get<Map<String, dynamic>>(
      '/api/user/carmunity-onboarding',
      options: Options(validateStatus: (s) => s == 200 || s == 401),
    );
    if (res.statusCode == 401) {
      throw ApiException(message: 'Sign in required', statusCode: 401);
    }
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    final prefsRaw = data['prefs'];
    final prefs = prefsRaw is Map ? Map<String, dynamic>.from(prefsRaw as Map) : null;
    return (completed: data['completed'] == true, prefs: prefs);
  }

  /// PATCH /api/user/carmunity-onboarding — same contract as web settings.
  Future<({bool completed, Map<String, dynamic>? prefs})> patchCarmunityOnboarding(
    Map<String, dynamic> body,
  ) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '/api/user/carmunity-onboarding',
      data: body,
    );
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['message'] ?? data['error'];
      throw ApiException(
        message: err is String ? err : 'Update failed',
        statusCode: res.statusCode,
      );
    }
    final prefsRaw = data['prefs'];
    final prefs = prefsRaw is Map ? Map<String, dynamic>.from(prefsRaw as Map) : null;
    return (completed: data['completed'] == true, prefs: prefs);
  }

  /// GET /api/carmunity/posts/[id]
  Future<PostDetailDto> fetchPostDetail(String postId) async {
    final res = await _client.get<Map<String, dynamic>>('/api/carmunity/posts/$postId');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Request failed',
        statusCode: res.statusCode,
      );
    }
    final post = data['post'];
    if (post is! Map) {
      throw ApiException(message: 'Invalid post payload', statusCode: res.statusCode);
    }
    return PostDetailDto.fromJson(Map<String, dynamic>.from(post));
  }

  /// POST /api/carmunity/posts — server validates non-empty text and/or image URL.
  Future<String> createPost({String? content, String? imageUrl}) async {
    final c = content?.trim();
    final img = imageUrl?.trim();
    final res = await _client.post<Map<String, dynamic>>(
      '/api/carmunity/posts',
      data: <String, dynamic>{
        if (c != null && c.isNotEmpty) 'content': c,
        if (img != null && img.isNotEmpty) 'imageUrl': img,
      },
    );
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final id = data!['postId'];
    if (id is! String) {
      throw ApiException(message: 'Invalid create response', statusCode: res.statusCode);
    }
    return id;
  }

  Future<({bool liked, int likeCount})> likePost(String postId) async {
    final res = await _client.post<Map<String, dynamic>>('/api/carmunity/posts/$postId/like');
    return _parseLikePayload(res.data, res.statusCode);
  }

  Future<({bool liked, int likeCount})> unlikePost(String postId) async {
    final res = await _client.delete<Map<String, dynamic>>('/api/carmunity/posts/$postId/like');
    return _parseLikePayload(res.data, res.statusCode);
  }

  Future<({String commentId, int commentCount})> addComment({
    required String postId,
    required String content,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/api/carmunity/posts/$postId/comments',
      data: <String, dynamic>{'content': content},
    );
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final cid = data!['commentId'];
    final cc = data['commentCount'];
    if (cid is! String || cc is! int) {
      throw ApiException(message: 'Invalid comment response', statusCode: res.statusCode);
    }
    return (commentId: cid, commentCount: cc);
  }

  Future<void> followUser(String targetUserId) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/api/carmunity/users/$targetUserId/follow',
    );
    _ensureOk(res.data, res.statusCode);
  }

  Future<void> unfollowUser(String targetUserId) async {
    final res = await _client.delete<Map<String, dynamic>>(
      '/api/carmunity/users/$targetUserId/follow',
    );
    _ensureOk(res.data, res.statusCode);
  }

  /// GET /api/carmunity/demo-accounts (development server only). Returns [] if unavailable.
  Future<List<DemoAccountDto>> fetchDemoAccounts() async {
    try {
      final res = await _client.raw.get<Map<String, dynamic>>(
        '/api/carmunity/demo-accounts',
        options: Options(validateStatus: (s) => s != null && s < 500),
      );
      if (res.statusCode != 200 || res.data == null) return [];
      final data = res.data!;
      if (data['ok'] != true) return [];
      final raw = data['accounts'];
      if (raw is! List) return [];
      return raw
          .whereType<Map>()
          .map((e) => DemoAccountDto.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } on DioException {
      return [];
    }
  }

  /// POST /api/carmunity/demo-session — mints NextAuth cookie value (development only).
  Future<({String userId, String sessionToken, String cookieName})> mintDemoSession({
    required String email,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/api/carmunity/demo-session',
      data: <String, dynamic>{'email': email.trim().toLowerCase()},
    );
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Demo sign-in failed',
        statusCode: res.statusCode,
      );
    }
    final userId = data['userId'];
    final sessionToken = data['sessionToken'];
    final cookieName = data['cookieName'];
    if (userId is! String || sessionToken is! String || cookieName is! String) {
      throw ApiException(message: 'Invalid demo session payload', statusCode: res.statusCode);
    }
    return (userId: userId, sessionToken: sessionToken, cookieName: cookieName);
  }

  /// GET /api/carmunity/me — requires session cookie or bearer. Null if not signed in.
  Future<CarmunityMeDto?> fetchMe() async {
    try {
      final res = await _client.raw.get<Map<String, dynamic>>(
        '/api/carmunity/me',
        options: Options(validateStatus: (s) => s == 200 || s == 401 || s == 404),
      );
      if (res.statusCode == 401 || res.statusCode == 404) return null;
      final data = res.data;
      if (data == null || data['ok'] != true) return null;
      final u = data['user'];
      if (u is! Map) return null;
      return CarmunityMeDto.fromJson(Map<String, dynamic>.from(u));
    } on DioException catch (e) {
      if (e.response?.statusCode == 401 || e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<List<PostSummary>> _fetchPosts(Map<String, dynamic> query) async {
    final res = await _client.get<Map<String, dynamic>>(_feedPath, queryParameters: query);
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    final raw = data['posts'];
    if (raw is! List) {
      throw ApiException(message: 'Invalid feed payload', statusCode: res.statusCode);
    }
    return raw
        .whereType<Map>()
        .map((e) => PostSummary.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  void _ensureOk(Map<String, dynamic>? data, int? status) {
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: status);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Request failed',
        statusCode: status,
      );
    }
  }

  ({bool liked, int likeCount}) _parseLikePayload(Map<String, dynamic>? data, int? status) {
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: status);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Request failed',
        statusCode: status,
      );
    }
    final liked = data['liked'];
    final likeCount = data['likeCount'];
    if (liked is! bool || likeCount is! int) {
      throw ApiException(message: 'Invalid like response', statusCode: status);
    }
    return (liked: liked, likeCount: likeCount);
  }
}
