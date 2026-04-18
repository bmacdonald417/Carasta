import 'forum_category_dto.dart';

/// Row from `GET /api/forums/spaces`.
class ForumSpaceDto {
  const ForumSpaceDto({
    required this.id,
    required this.slug,
    required this.title,
    this.description,
    required this.sortOrder,
    required this.categoryCount,
  });

  final String id;
  final String slug;
  final String title;
  final String? description;
  final int sortOrder;
  final int categoryCount;

  factory ForumSpaceDto.fromJson(Map<String, dynamic> json) {
    return ForumSpaceDto(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      categoryCount: (json['categoryCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// `GET /api/forums/spaces/[slug]` — space with categories.
class ForumSpaceDetailDto {
  const ForumSpaceDetailDto({
    required this.id,
    required this.slug,
    required this.title,
    this.description,
    required this.sortOrder,
    required this.categories,
  });

  final String id;
  final String slug;
  final String title;
  final String? description;
  final int sortOrder;
  final List<ForumCategoryDto> categories;

  factory ForumSpaceDetailDto.fromJson(Map<String, dynamic> json) {
    final cats = json['categories'];
    return ForumSpaceDetailDto(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      categories: cats is List
          ? cats
              .whereType<Map>()
              .map((e) => ForumCategoryDto.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}
