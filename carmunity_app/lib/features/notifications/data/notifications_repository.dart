import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/dto/notification_summary.dart';

class NotificationPage {
  const NotificationPage({
    required this.items,
    this.nextCursorCreatedAt,
    this.nextCursorId,
  });

  final List<NotificationSummary> items;
  final String? nextCursorCreatedAt;
  final String? nextCursorId;
}

/// Carasta in-app notifications — same endpoints as web (`NotificationDropdown`).
class NotificationsRepository {
  NotificationsRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  static const _base = '/api/notifications';

  Future<int> fetchUnreadCount() async {
    final res = await _client.get<Map<String, dynamic>>('$_base/unread-count');
    final data = res.data;
    final c = data?['count'];
    if (c is int) return c;
    if (c is num) return c.toInt();
    return 0;
  }

  Future<NotificationPage> fetchPage({
    int take = 25,
    String? cursorCreatedAt,
    String? cursorId,
  }) async {
    final qp = <String, dynamic>{
      'take': take,
      if (cursorCreatedAt != null) 'cursorCreatedAt': cursorCreatedAt,
      if (cursorId != null) 'cursorId': cursorId,
    };
    final res = await _client.get<Map<String, dynamic>>(_base, queryParameters: qp);
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    final raw = data['items'];
    if (raw is! List) {
      throw ApiException(message: 'Invalid notifications payload', statusCode: res.statusCode);
    }
    final items = raw
        .whereType<Map>()
        .map((e) => NotificationSummary.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final nc = data['nextCursor'];
    if (nc is Map) {
      final ca = nc['createdAt'];
      final id = nc['id'];
      if (ca is String && id is String) {
        return NotificationPage(items: items, nextCursorCreatedAt: ca, nextCursorId: id);
      }
    }
    return NotificationPage(items: items);
  }

  Future<void> markRead(String id) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '$_base/${Uri.encodeComponent(id)}/read',
    );
    final data = res.data;
    if (data == null || data['ok'] != true) {
      final msg = data?['message'];
      throw ApiException(
        message: msg is String ? msg : 'Mark read failed',
        statusCode: res.statusCode,
      );
    }
  }

  Future<int> markAllRead() async {
    final res = await _client.post<Map<String, dynamic>>('$_base/read-all');
    final data = res.data;
    if (data == null || data['ok'] != true) {
      final msg = data?['message'];
      throw ApiException(
        message: msg is String ? msg : 'Mark all read failed',
        statusCode: res.statusCode,
      );
    }
    final u = data['updated'];
    if (u is int) return u;
    if (u is num) return u.toInt();
    return 0;
  }
}
