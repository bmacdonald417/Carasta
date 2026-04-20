class SavedThreadSubscriptionDto {
  const SavedThreadSubscriptionDto({
    required this.subscriptionId,
    required this.subscribedAt,
    this.lastViewedAt,
    required this.threadId,
    required this.threadTitle,
    required this.replyCount,
    required this.lastActivityAt,
    required this.spaceSlug,
    required this.spaceTitle,
    required this.categorySlug,
  });

  final String subscriptionId;
  final String subscribedAt;
  final String? lastViewedAt;
  final String threadId;
  final String threadTitle;
  final int replyCount;
  final String lastActivityAt;
  final String spaceSlug;
  final String spaceTitle;
  final String categorySlug;

  factory SavedThreadSubscriptionDto.fromJson(Map<String, dynamic> json) {
    final thread = json['thread'];
    if (thread is! Map) {
      throw const FormatException('saved thread: missing thread');
    }
    final t = Map<String, dynamic>.from(thread);
    return SavedThreadSubscriptionDto(
      subscriptionId: json['subscriptionId'] as String,
      subscribedAt: json['subscribedAt'] as String,
      lastViewedAt: json['lastViewedAt'] as String?,
      threadId: t['id'] as String,
      threadTitle: t['title'] as String,
      replyCount: (t['replyCount'] as num?)?.toInt() ?? 0,
      lastActivityAt: t['lastActivityAt'] as String,
      spaceSlug: t['spaceSlug'] as String,
      spaceTitle: t['spaceTitle'] as String,
      categorySlug: t['categorySlug'] as String,
    );
  }
}
