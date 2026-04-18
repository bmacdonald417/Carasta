class AuctionImageDto {
  const AuctionImageDto({
    required this.id,
    required this.url,
    required this.sortOrder,
  });

  final String id;
  final String url;
  final int sortOrder;

  factory AuctionImageDto.fromJson(Map<String, dynamic> json) {
    return AuctionImageDto(
      id: json['id'] as String? ?? '',
      url: json['url'] as String? ?? '',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }
}
