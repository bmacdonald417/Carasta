import 'forum_author_dto.dart';

class ForumThreadSummaryDto {
  const ForumThreadSummaryDto({
    required this.id,
    required this.title,
    required this.replyCount,
    required this.lastActivityAt,
    required this.createdAt,
    required this.author,
  });

  final String id;
  final String title;
  final int replyCount;
  final DateTime lastActivityAt;
  final DateTime createdAt;
  final ForumAuthorDto author;

  factory ForumThreadSummaryDto.fromJson(Map<String, dynamic> json) {
    return ForumThreadSummaryDto(
      id: json['id'] as String,
      title: json['title'] as String,
      replyCount: (json['replyCount'] as num?)?.toInt() ?? 0,
      lastActivityAt: DateTime.parse(json['lastActivityAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      author: ForumAuthorDto.fromJson(Map<String, dynamic>.from(json['author'] as Map)),
    );
  }
}
