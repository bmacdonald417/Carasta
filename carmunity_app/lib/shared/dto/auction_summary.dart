/// Browse-card projection (align with `GET /api/auctions/search` result rows when wired).
class AuctionSummary {
  const AuctionSummary({
    required this.id,
    required this.title,
    required this.status,
    this.year,
    this.make,
    this.model,
    this.primaryImageUrl,
    this.highBidCents,
    this.endAt,
  });

  final String id;
  final String title;
  final String status;
  final int? year;
  final String? make;
  final String? model;
  final String? primaryImageUrl;
  final int? highBidCents;
  final DateTime? endAt;
}
