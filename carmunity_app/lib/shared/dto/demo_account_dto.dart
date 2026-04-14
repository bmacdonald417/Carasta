class DemoAccountDto {
  const DemoAccountDto({
    required this.id,
    required this.email,
    required this.handle,
    required this.name,
    required this.postsCount,
    required this.listingsCount,
    required this.label,
    required this.subtitle,
  });

  final String id;
  final String email;
  final String handle;
  final String? name;
  final int postsCount;
  final int listingsCount;
  final String label;
  final String subtitle;

  factory DemoAccountDto.fromJson(Map<String, dynamic> json) {
    return DemoAccountDto(
      id: json['id'] as String,
      email: json['email'] as String,
      handle: json['handle'] as String,
      name: json['name'] as String?,
      postsCount: (json['postsCount'] as num?)?.toInt() ?? 0,
      listingsCount: (json['listingsCount'] as num?)?.toInt() ?? 0,
      label: json['label'] as String? ?? json['handle'] as String,
      subtitle: json['subtitle'] as String? ?? '',
    );
  }
}
