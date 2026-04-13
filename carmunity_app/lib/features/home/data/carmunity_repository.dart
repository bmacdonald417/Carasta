import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../shared/dto/post_summary.dart';

/// Read-only Carmunity feed access — delegates to Carasta `GET /api/explore/feed`.
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
}
