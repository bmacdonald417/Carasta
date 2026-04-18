import 'auction_image_dto.dart';
import 'auction_seller_dto.dart';

/// `GET /api/auctions/[id]` — read-only listing detail for Carmunity.
class AuctionDetailDto {
  const AuctionDetailDto({
    required this.id,
    required this.title,
    this.description,
    required this.year,
    required this.make,
    required this.model,
    this.trim,
    required this.status,
    required this.startAt,
    required this.endAt,
    required this.createdAt,
    this.mileage,
    this.conditionGrade,
    this.conditionSummary,
    this.locationZip,
    this.latitude,
    this.longitude,
    required this.highBidCents,
    this.highBidderHandle,
    this.reserveMeterPercent,
    this.reservePriceCents,
    this.buyNowPriceCents,
    this.buyNowExpiresAt,
    required this.bidCount,
    required this.images,
    required this.seller,
    this.watching = false,
  });

  final String id;
  final String title;
  final String? description;
  final int year;
  final String make;
  final String model;
  final String? trim;
  final String status;
  final DateTime startAt;
  final DateTime endAt;
  final DateTime createdAt;
  final int? mileage;
  final String? conditionGrade;
  final String? conditionSummary;
  final String? locationZip;
  final double? latitude;
  final double? longitude;
  final int highBidCents;
  final String? highBidderHandle;
  final int? reserveMeterPercent;
  final int? reservePriceCents;
  final int? buyNowPriceCents;
  final DateTime? buyNowExpiresAt;
  final int bidCount;
  final List<AuctionImageDto> images;
  final AuctionSellerDetailDto seller;
  final bool watching;

  factory AuctionDetailDto.fromJson(Map<String, dynamic> json) {
    final rawImages = json['images'];
    final images = rawImages is List
        ? rawImages
            .whereType<Map>()
            .map((e) => AuctionImageDto.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <AuctionImageDto>[];

    return AuctionDetailDto(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      year: (json['year'] as num?)?.toInt() ?? 0,
      make: json['make'] as String? ?? '',
      model: json['model'] as String? ?? '',
      trim: json['trim'] as String?,
      status: json['status'] as String? ?? '',
      startAt: DateTime.tryParse(json['startAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      endAt: DateTime.tryParse(json['endAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      mileage: (json['mileage'] as num?)?.toInt(),
      conditionGrade: json['conditionGrade'] as String?,
      conditionSummary: json['conditionSummary'] as String?,
      locationZip: json['locationZip'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      highBidCents: (json['highBidCents'] as num?)?.toInt() ?? 0,
      highBidderHandle: json['highBidderHandle'] as String?,
      reserveMeterPercent: (json['reserveMeterPercent'] as num?)?.toInt(),
      reservePriceCents: (json['reservePriceCents'] as num?)?.toInt(),
      buyNowPriceCents: (json['buyNowPriceCents'] as num?)?.toInt(),
      buyNowExpiresAt: json['buyNowExpiresAt'] != null
          ? DateTime.tryParse(json['buyNowExpiresAt'] as String)
          : null,
      bidCount: (json['bidCount'] as num?)?.toInt() ?? 0,
      images: images,
      seller: AuctionSellerDetailDto.fromJson(json['seller']),
      watching: json['watching'] == true,
    );
  }
}
