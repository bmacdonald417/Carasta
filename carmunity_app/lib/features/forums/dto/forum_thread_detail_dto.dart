import 'forum_author_dto.dart';
import 'forum_reply_dto.dart';

class ForumThreadSpaceRefDto {
  const ForumThreadSpaceRefDto({
    required this.id,
    required this.slug,
    required this.title,
  });

  final String id;
  final String slug;
  final String title;

  factory ForumThreadSpaceRefDto.fromJson(Map<String, dynamic> json) {
    return ForumThreadSpaceRefDto(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
    );
  }
}

class ForumThreadCategoryRefDto {
  const ForumThreadCategoryRefDto({
    required this.id,
    required this.slug,
    required this.title,
    required this.space,
  });

  final String id;
  final String slug;
  final String title;
  final ForumThreadSpaceRefDto space;

  factory ForumThreadCategoryRefDto.fromJson(Map<String, dynamic> json) {
    return ForumThreadCategoryRefDto(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      space: ForumThreadSpaceRefDto.fromJson(Map<String, dynamic>.from(json['space'] as Map)),
    );
  }
}

/// Full thread from `GET /api/forums/threads/[id]`.
class ForumThreadDetailDto {
  const ForumThreadDetailDto({
    required this.id,
    required this.title,
    required this.body,
    required this.replyCount,
    required this.locked,
    required this.lastActivityAt,
    required this.createdAt,
    required this.category,
    required this.author,
    required this.replies,
  });

  final String id;
  final String title;
  final String body;
  final int replyCount;
  final bool locked;
  final DateTime lastActivityAt;
  final DateTime createdAt;
  final ForumThreadCategoryRefDto category;
  final ForumAuthorDto author;
  final List<ForumReplyDto> replies;

  factory ForumThreadDetailDto.fromJson(Map<String, dynamic> json) {
    final rep = json['replies'];
    return ForumThreadDetailDto(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      replyCount: (json['replyCount'] as num?)?.toInt() ?? 0,
      locked: json['locked'] as bool? ?? false,
      lastActivityAt: DateTime.parse(json['lastActivityAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      category: ForumThreadCategoryRefDto.fromJson(Map<String, dynamic>.from(json['category'] as Map)),
      author: ForumAuthorDto.fromJson(Map<String, dynamic>.from(json['author'] as Map)),
      replies: rep is List
          ? rep
              .whereType<Map>()
              .map((e) => ForumReplyDto.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}
