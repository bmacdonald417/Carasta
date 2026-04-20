/// In-app notification row — mirrors `GET /api/notifications` items.
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

  factory NotificationSummary.fromJson(Map<String, dynamic> json) {
    final createdRaw = json['createdAt'];
    final readRaw = json['readAt'];
    final payloadRaw = json['payload'];
    return NotificationSummary(
      id: json['id'] as String,
      type: json['type'] as String,
      createdAt: DateTime.parse(createdRaw as String),
      readAt: readRaw == null ? null : DateTime.parse(readRaw as String),
      payload: payloadRaw is Map ? Map<String, dynamic>.from(payloadRaw as Map) : const {},
    );
  }
}
