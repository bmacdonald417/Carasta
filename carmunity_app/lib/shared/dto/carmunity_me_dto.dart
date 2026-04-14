class CarmunityMeCountsDto {
  const CarmunityMeCountsDto({
    required this.posts,
    required this.followers,
    required this.following,
    required this.garageCars,
  });

  final int posts;
  final int followers;
  final int following;
  final int garageCars;

  factory CarmunityMeCountsDto.fromJson(Map<String, dynamic> json) {
    return CarmunityMeCountsDto(
      posts: (json['posts'] as num?)?.toInt() ?? 0,
      followers: (json['followers'] as num?)?.toInt() ?? 0,
      following: (json['following'] as num?)?.toInt() ?? 0,
      garageCars: (json['garageCars'] as num?)?.toInt() ?? 0,
    );
  }
}

class CarmunityRecentPostDto {
  const CarmunityRecentPostDto({
    required this.id,
    this.imageUrl,
    this.content,
  });

  final String id;
  final String? imageUrl;
  final String? content;

  factory CarmunityRecentPostDto.fromJson(Map<String, dynamic> json) {
    return CarmunityRecentPostDto(
      id: json['id'] as String,
      imageUrl: json['imageUrl'] as String?,
      content: json['content'] as String?,
    );
  }
}

class CarmunityMeDto {
  const CarmunityMeDto({
    required this.id,
    required this.handle,
    required this.name,
    this.bio,
    this.avatarUrl,
    this.instagramUrl,
    this.facebookUrl,
    this.twitterUrl,
    this.tiktokUrl,
    required this.counts,
    required this.recentPosts,
  });

  final String id;
  final String handle;
  final String? name;
  final String? bio;
  final String? avatarUrl;
  final String? instagramUrl;
  final String? facebookUrl;
  final String? twitterUrl;
  final String? tiktokUrl;
  final CarmunityMeCountsDto counts;
  final List<CarmunityRecentPostDto> recentPosts;

  factory CarmunityMeDto.fromJson(Map<String, dynamic> json) {
    final countsRaw = json['counts'];
    final recentRaw = json['recentPosts'];
    return CarmunityMeDto(
      id: json['id'] as String,
      handle: json['handle'] as String,
      name: json['name'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      instagramUrl: json['instagramUrl'] as String?,
      facebookUrl: json['facebookUrl'] as String?,
      twitterUrl: json['twitterUrl'] as String?,
      tiktokUrl: json['tiktokUrl'] as String?,
      counts: countsRaw is Map
          ? CarmunityMeCountsDto.fromJson(Map<String, dynamic>.from(countsRaw))
          : const CarmunityMeCountsDto(posts: 0, followers: 0, following: 0, garageCars: 0),
      recentPosts: recentRaw is List
          ? recentRaw
              .whereType<Map>()
              .map((e) => CarmunityRecentPostDto.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}
