/// Seller snapshot on search hits (handle only from API).
class AuctionSellerHitDto {
  const AuctionSellerHitDto({this.handle});

  final String? handle;

  factory AuctionSellerHitDto.fromJson(Object? json) {
    if (json is! Map) return const AuctionSellerHitDto();
    final m = Map<String, dynamic>.from(json);
    return AuctionSellerHitDto(handle: m['handle'] as String?);
  }
}

/// Seller on auction detail.
class AuctionSellerDetailDto {
  const AuctionSellerDetailDto({
    required this.id,
    required this.handle,
    this.name,
    this.avatarUrl,
  });

  final String id;
  final String handle;
  final String? name;
  final String? avatarUrl;

  factory AuctionSellerDetailDto.fromJson(Object? json) {
    if (json is! Map) {
      return const AuctionSellerDetailDto(id: '', handle: '');
    }
    final m = Map<String, dynamic>.from(json);
    return AuctionSellerDetailDto(
      id: m['id'] as String? ?? '',
      handle: m['handle'] as String? ?? '',
      name: m['name'] as String?,
      avatarUrl: m['avatarUrl'] as String?,
    );
  }
}
