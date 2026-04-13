/// In-app notification row (align with notifications API when wired).
class NotificationSummary {
  const NotificationSummary({
    required this.id,
    required this.type,
    required this.createdAt,
    this.readAt,
    this.payload = const <String, dynamic>{},
  });

  final String id;
  final String type;
  final DateTime createdAt;
  final DateTime? readAt;
  final Map<String, dynamic> payload;

  bool get isUnread => readAt == null;
}
