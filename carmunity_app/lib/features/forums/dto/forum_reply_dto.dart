import 'forum_author_dto.dart';

class ForumReplyDto {
  const ForumReplyDto({
    required this.id,
    required this.body,
    required this.createdAt,
    required this.author,
  });

  final String id;
  final String body;
  final DateTime createdAt;
  final ForumAuthorDto author;

  factory ForumReplyDto.fromJson(Map<String, dynamic> json) {
    return ForumReplyDto(
      id: json['id'] as String,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      author: ForumAuthorDto.fromJson(Map<String, dynamic>.from(json['author'] as Map)),
    );
  }
}
