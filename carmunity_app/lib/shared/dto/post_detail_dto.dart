import 'user_summary.dart';

class CommentDto {
  const CommentDto({
    required this.id,
    required this.content,
    required this.createdAt,
    required this.author,
  });

  final String id;
  final String content;
  final DateTime createdAt;
  final UserSummary author;

  factory CommentDto.fromJson(Map<String, dynamic> json) {
    final a = json['author'];
    if (a is! Map<String, dynamic>) {
      throw FormatException('Comment missing author', json);
    }
    return CommentDto(
      id: json['id'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      author: UserSummary.fromJson(a),
    );
  }
}

class PostDetailDto {
  const PostDetailDto({
    required this.id,
    required this.authorId,
    required this.createdAt,
    required this.author,
    required this.liked,
    required this.likeCount,
    required this.commentCount,
    required this.viewerFollowsAuthor,
    required this.comments,
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
  final bool liked;
  final int likeCount;
  final int commentCount;
  final bool viewerFollowsAuthor;
  final List<CommentDto> comments;

  factory PostDetailDto.fromJson(Map<String, dynamic> json) {
    final authorJson = json['author'];
    if (authorJson is! Map<String, dynamic>) {
      throw FormatException('Post missing author', json);
    }
    final rawComments = json['comments'];
    final comments = rawComments is List
        ? rawComments
            .whereType<Map>()
            .map((e) => CommentDto.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <CommentDto>[];

    return PostDetailDto(
      id: json['id'] as String,
      authorId: json['authorId'] as String,
      auctionId: json['auctionId'] as String?,
      content: json['content'] as String?,
      imageUrl: json['imageUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      author: UserSummary.fromJson(authorJson),
      liked: json['liked'] as bool? ?? false,
      likeCount: json['likeCount'] as int? ?? 0,
      commentCount: json['commentCount'] as int? ?? 0,
      viewerFollowsAuthor: json['viewerFollowsAuthor'] as bool? ?? false,
      comments: comments,
    );
  }

  PostDetailDto copyWith({
    bool? liked,
    int? likeCount,
    int? commentCount,
    bool? viewerFollowsAuthor,
    List<CommentDto>? comments,
  }) {
    return PostDetailDto(
      id: id,
      authorId: authorId,
      auctionId: auctionId,
      content: content,
      imageUrl: imageUrl,
      createdAt: createdAt,
      author: author,
      liked: liked ?? this.liked,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      viewerFollowsAuthor: viewerFollowsAuthor ?? this.viewerFollowsAuthor,
      comments: comments ?? this.comments,
    );
  }
}
