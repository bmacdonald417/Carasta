/// Row from `GET /api/carmunity/watchlist` `items[]`.
class AuctionWatchSummaryDto {
  const AuctionWatchSummaryDto({
    required this.id,
    required this.title,
    required this.endAt,
    this.imageUrl,
    required this.status,
  });

  final String id;
  final String title;
  final DateTime endAt;
  final String? imageUrl;
  final String status;

  factory AuctionWatchSummaryDto.fromJson(Map<String, dynamic> json) {
    return AuctionWatchSummaryDto(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      endAt: DateTime.tryParse(json['endAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      imageUrl: json['imageUrl'] as String?,
      status: json['status'] as String? ?? '',
    );
  }
}
