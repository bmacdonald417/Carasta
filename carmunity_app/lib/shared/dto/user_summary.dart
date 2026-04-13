/// Minimal user projection for lists and cards (matches explore feed author shape).
class UserSummary {
  const UserSummary({
    required this.id,
    required this.handle,
    this.name,
    this.avatarUrl,
  });

  final String id;
  final String handle;
  final String? name;
  final String? avatarUrl;

  factory UserSummary.fromJson(Map<String, dynamic> json) {
    return UserSummary(
      id: json['id'] as String,
      handle: json['handle'] as String,
      name: json['name'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  String get displayName => name?.trim().isNotEmpty == true ? name!.trim() : '@$handle';
}
