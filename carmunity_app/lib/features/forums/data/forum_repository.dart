import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../dto/forum_space_dto.dart';
import '../dto/forum_thread_detail_dto.dart';
import '../dto/forum_thread_summary_dto.dart';

/// Carmunity forums — Carasta JSON APIs only (`FORUMS_API_CONTRACT.md`).
class ForumRepository {
  ForumRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  static const _base = '/api/forums';

  Future<List<ForumSpaceDto>> getSpaces() async {
    final res = await _client.get<Map<String, dynamic>>('$_base/spaces');
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final raw = data!['spaces'];
    if (raw is! List) {
      throw ApiException(message: 'Invalid spaces payload', statusCode: res.statusCode);
    }
    return raw
        .whereType<Map>()
        .map((e) => ForumSpaceDto.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<ForumSpaceDetailDto> getSpaceDetail(String slug) async {
    final encoded = Uri.encodeComponent(slug);
    final res = await _client.get<Map<String, dynamic>>('$_base/spaces/$encoded');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Space not found', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Space not found',
        statusCode: res.statusCode,
      );
    }
    final s = data['space'];
    if (s is! Map) {
      throw ApiException(message: 'Invalid space payload', statusCode: res.statusCode);
    }
    return ForumSpaceDetailDto.fromJson(Map<String, dynamic>.from(s));
  }

  Future<({List<ForumThreadSummaryDto> threads, String? nextCursor})> getCategoryThreads({
    required String categoryId,
    int take = 20,
    String? cursor,
  }) async {
    final res = await _client.get<Map<String, dynamic>>(
      '$_base/categories/$categoryId/threads',
      queryParameters: <String, dynamic>{
        if (take != 20) 'take': take,
        if (cursor != null && cursor.isNotEmpty) 'cursor': cursor,
      },
    );
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final raw = data!['threads'];
    if (raw is! List) {
      throw ApiException(message: 'Invalid threads payload', statusCode: res.statusCode);
    }
    final threads = raw
        .whereType<Map>()
        .map((e) => ForumThreadSummaryDto.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final next = data['nextCursor'];
    final nextCursor = next is String && next.isNotEmpty ? next : null;
    return (threads: threads, nextCursor: nextCursor);
  }

  Future<ForumThreadDetailDto> getThreadDetail(String threadId) async {
    final res = await _client.get<Map<String, dynamic>>('$_base/threads/$threadId');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Thread not found', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Thread not found',
        statusCode: res.statusCode,
      );
    }
    final t = data['thread'];
    if (t is! Map) {
      throw ApiException(message: 'Invalid thread payload', statusCode: res.statusCode);
    }
    return ForumThreadDetailDto.fromJson(Map<String, dynamic>.from(t));
  }

  Future<String> createThread({
    required String categoryId,
    required String title,
    required String body,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '$_base/threads',
      data: <String, dynamic>{
        'categoryId': categoryId,
        'title': title,
        'body': body,
      },
    );
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final id = data!['threadId'];
    if (id is! String) {
      throw ApiException(message: 'Invalid create thread response', statusCode: res.statusCode);
    }
    return id;
  }

  Future<({String replyId, int replyCount})> createReply({
    required String threadId,
    required String body,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '$_base/threads/$threadId/replies',
      data: <String, dynamic>{'body': body},
    );
    final data = res.data;
    _ensureOk(data, res.statusCode);
    final rid = data!['replyId'];
    final rc = data['replyCount'];
    if (rid is! String || rc is! int) {
      throw ApiException(message: 'Invalid reply response', statusCode: res.statusCode);
    }
    return (replyId: rid, replyCount: rc);
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
}
