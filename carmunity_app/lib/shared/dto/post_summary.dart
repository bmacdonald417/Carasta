import 'user_summary.dart';

/// Feed card projection for `GET /api/explore/feed`.
class PostSummary {
  const PostSummary({
    required this.id,
    required this.authorId,
    required this.createdAt,
    required this.author,
    required this.likeCount,
    required this.commentCount,
    required this.liked,
    this.auctionId,
    this.content,
    this.imageUrl,
  });

  final String id;
  final String authorId;
  final String? auctionId;
  final String? content;
  final String? imageUrl;
  final DateTime createdAt;
  final UserSummary author;
  final int likeCount;
  final int commentCount;
  final bool liked;

  factory PostSummary.fromJson(Map<String, dynamic> json) {
    final authorJson = json['author'];
    if (authorJson is! Map<String, dynamic>) {
      throw FormatException('Post missing author', json);
    }
    final countJson = json['_count'];
    final likes = countJson is Map<String, dynamic> ? (countJson['likes'] as int? ?? 0) : 0;
    final comments =
        countJson is Map<String, dynamic> ? (countJson['comments'] as int? ?? 0) : 0;

    return PostSummary(
      id: json['id'] as String,
      authorId: json['authorId'] as String,
      auctionId: json['auctionId'] as String?,
      content: json['content'] as String?,
      imageUrl: json['imageUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      author: UserSummary.fromJson(authorJson),
      likeCount: likes,
      commentCount: comments,
      liked: json['liked'] as bool? ?? false,
    );
  }
}
