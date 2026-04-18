import 'auction_image_dto.dart';
import 'auction_seller_dto.dart';

/// Single row from `GET /api/auctions/search` `results[]`.
class AuctionListItemDto {
  const AuctionListItemDto({
    required this.id,
    required this.title,
    required this.year,
    required this.make,
    required this.model,
    this.trim,
    required this.status,
    required this.endAt,
    required this.startAt,
    required this.createdAt,
    this.reservePriceCents,
    this.buyNowPriceCents,
    this.mileage,
    this.conditionGrade,
    this.locationZip,
    this.latitude,
    this.longitude,
    required this.highBidCents,
    required this.bidCount,
    required this.images,
    required this.seller,
  });

  final String id;
  final String title;
  final int year;
  final String make;
  final String model;
  final String? trim;
  final String status;
  final DateTime endAt;
  final DateTime startAt;
  final DateTime createdAt;
  final int? reservePriceCents;
  final int? buyNowPriceCents;
  final int? mileage;
  final String? conditionGrade;
  final String? locationZip;
  final double? latitude;
  final double? longitude;
  final int highBidCents;
  final int bidCount;
  final List<AuctionImageDto> images;
  final AuctionSellerHitDto seller;

  factory AuctionListItemDto.fromJson(Map<String, dynamic> json) {
    final rawImages = json['images'];
    final images = rawImages is List
        ? rawImages
            .whereType<Map>()
            .map((e) => AuctionImageDto.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <AuctionImageDto>[];

    return AuctionListItemDto(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      year: (json['year'] as num?)?.toInt() ?? 0,
      make: json['make'] as String? ?? '',
      model: json['model'] as String? ?? '',
      trim: json['trim'] as String?,
      status: json['status'] as String? ?? '',
      endAt: DateTime.tryParse(json['endAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      startAt: DateTime.tryParse(json['startAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0),
      reservePriceCents: (json['reservePriceCents'] as num?)?.toInt(),
      buyNowPriceCents: (json['buyNowPriceCents'] as num?)?.toInt(),
      mileage: (json['mileage'] as num?)?.toInt(),
      conditionGrade: json['conditionGrade'] as String?,
      locationZip: json['locationZip'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      highBidCents: (json['highBidCents'] as num?)?.toInt() ?? 0,
      bidCount: (json['bidCount'] as num?)?.toInt() ?? 0,
      images: images,
      seller: AuctionSellerHitDto.fromJson(json['seller']),
    );
  }
}
