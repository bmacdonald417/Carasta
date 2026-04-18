import 'auction_list_item_dto.dart';

class AuctionSearchPaginationDto {
  const AuctionSearchPaginationDto({
    required this.page,
    required this.pageSize,
    required this.total,
    this.highBidSortTruncated,
  });

  final int page;
  final int pageSize;
  final int total;
  final bool? highBidSortTruncated;

  factory AuctionSearchPaginationDto.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const AuctionSearchPaginationDto(page: 1, pageSize: 24, total: 0);
    }
    return AuctionSearchPaginationDto(
      page: (json['page'] as num?)?.toInt() ?? 1,
      pageSize: (json['pageSize'] as num?)?.toInt() ?? 24,
      total: (json['total'] as num?)?.toInt() ?? 0,
      highBidSortTruncated: json['highBidSortTruncated'] as bool?,
    );
  }

  bool get hasMore => page * pageSize < total;
}

class AuctionSearchPageDto {
  const AuctionSearchPageDto({
    required this.results,
    required this.pagination,
  });

  final List<AuctionListItemDto> results;
  final AuctionSearchPaginationDto pagination;

  factory AuctionSearchPageDto.fromJson(Map<String, dynamic> json) {
    final raw = json['results'];
    final results = raw is List
        ? raw
            .whereType<Map>()
            .map((e) => AuctionListItemDto.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <AuctionListItemDto>[];
    final pag = json['pagination'];
    return AuctionSearchPageDto(
      results: results,
      pagination: AuctionSearchPaginationDto.fromJson(
        pag is Map ? Map<String, dynamic>.from(pag) : null,
      ),
    );
  }
}
