class ForumAuthorDto {
  const ForumAuthorDto({
    required this.id,
    required this.handle,
    this.name,
    this.avatarUrl,
  });

  final String id;
  final String handle;
  final String? name;
  final String? avatarUrl;

  factory ForumAuthorDto.fromJson(Map<String, dynamic> json) {
    return ForumAuthorDto(
      id: json['id'] as String,
      handle: json['handle'] as String,
      name: json['name'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}
