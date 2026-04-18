class ForumCategoryDto {
  const ForumCategoryDto({
    required this.id,
    required this.slug,
    required this.title,
    this.description,
    required this.sortOrder,
    required this.threadCount,
    this.metadata,
  });

  final String id;
  final String slug;
  final String title;
  final String? description;
  final int sortOrder;
  final int threadCount;
  final Object? metadata;

  factory ForumCategoryDto.fromJson(Map<String, dynamic> json) {
    return ForumCategoryDto(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      threadCount: (json['threadCount'] as num?)?.toInt() ?? 0,
      metadata: json['metadata'],
    );
  }
}
