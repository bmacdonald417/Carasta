/// Mirrors `GET /api/auctions/search` query params (`AUCTION_SEARCH_ARCHITECTURE.md`).
enum AuctionSearchSort {
  endingSoon('ENDING_SOON'),
  newest('NEWEST'),
  priceAsc('PRICE_ASC'),
  priceDesc('PRICE_DESC'),
  highestBid('HIGHEST_BID');

  const AuctionSearchSort(this.apiValue);

  final String apiValue;

  String get label {
    switch (this) {
      case AuctionSearchSort.endingSoon:
        return 'Ending soon';
      case AuctionSearchSort.newest:
        return 'Newest';
      case AuctionSearchSort.priceAsc:
        return 'Price: low to high';
      case AuctionSearchSort.priceDesc:
        return 'Price: high to low';
      case AuctionSearchSort.highestBid:
        return 'Highest bid';
    }
  }
}

/// Filter + sort state for browse (page is applied per fetch, not stored here).
class AuctionFilterState {
  const AuctionFilterState({
    this.query = '',
    this.sort = AuctionSearchSort.endingSoon,
    this.yearMin,
    this.yearMax,
    this.priceMinDollars,
    this.priceMaxDollars,
    this.mileageMin,
    this.mileageMax,
    this.location = '',
    this.conditionGrade,
    this.featuredOnly = false,
    this.noReserve = false,
    this.endingSoon = false,
    this.status = 'LIVE',
    this.zip = '',
    this.radiusMiles,
    this.pageSize = 24,
  });

  final String query;
  final AuctionSearchSort sort;
  final int? yearMin;
  final int? yearMax;
  final double? priceMinDollars;
  final double? priceMaxDollars;
  final int? mileageMin;
  final int? mileageMax;
  final String location;
  /// `CONCOURS` | `EXCELLENT` | … or null for any.
  final String? conditionGrade;
  /// Accepted by API; **no DB field yet** — may not narrow results.
  final bool featuredOnly;
  final bool noReserve;
  final bool endingSoon;
  final String status;
  final String zip;
  final int? radiusMiles;
  final int pageSize;

  AuctionFilterState copyWith({
    String? query,
    AuctionSearchSort? sort,
    int? yearMin,
    int? yearMax,
    double? priceMinDollars,
    double? priceMaxDollars,
    int? mileageMin,
    int? mileageMax,
    String? location,
    String? conditionGrade,
    bool clearConditionGrade = false,
    bool? featuredOnly,
    bool? noReserve,
    bool? endingSoon,
    String? status,
    String? zip,
    int? radiusMiles,
    bool clearRadius = false,
    int? pageSize,
  }) {
    return AuctionFilterState(
      query: query ?? this.query,
      sort: sort ?? this.sort,
      yearMin: yearMin ?? this.yearMin,
      yearMax: yearMax ?? this.yearMax,
      priceMinDollars: priceMinDollars ?? this.priceMinDollars,
      priceMaxDollars: priceMaxDollars ?? this.priceMaxDollars,
      mileageMin: mileageMin ?? this.mileageMin,
      mileageMax: mileageMax ?? this.mileageMax,
      location: location ?? this.location,
      conditionGrade: clearConditionGrade ? null : (conditionGrade ?? this.conditionGrade),
      featuredOnly: featuredOnly ?? this.featuredOnly,
      noReserve: noReserve ?? this.noReserve,
      endingSoon: endingSoon ?? this.endingSoon,
      status: status ?? this.status,
      zip: zip ?? this.zip,
      radiusMiles: clearRadius ? null : (radiusMiles ?? this.radiusMiles),
      pageSize: pageSize ?? this.pageSize,
    );
  }

  /// Build query map for [AuctionRepository.searchAuctions].
  Map<String, String> toQueryParams({required int page}) {
    final p = <String, String>{
      'page': '$page',
      'pageSize': '$pageSize',
      'status': status.trim().isEmpty ? 'LIVE' : status.trim(),
      'sort': sort.apiValue,
    };
    final q = query.trim();
    if (q.isNotEmpty) p['q'] = q;
    if (yearMin != null) p['yearMin'] = '$yearMin';
    if (yearMax != null) p['yearMax'] = '$yearMax';
    if (priceMinDollars != null && priceMinDollars! >= 0) {
      p['priceMin'] = _trimNum(priceMinDollars!);
    }
    if (priceMaxDollars != null && priceMaxDollars! >= 0) {
      p['priceMax'] = _trimNum(priceMaxDollars!);
    }
    if (mileageMin != null) p['mileageMin'] = '$mileageMin';
    if (mileageMax != null) p['mileageMax'] = '$mileageMax';
    final loc = location.trim();
    if (loc.isNotEmpty) p['location'] = loc;
    final c = conditionGrade?.trim();
    if (c != null && c.isNotEmpty) p['condition'] = c;
    if (featuredOnly) p['featuredOnly'] = 'true';
    if (noReserve) p['noReserve'] = 'true';
    if (endingSoon) p['endingSoon'] = 'true';
    final z = zip.trim();
    if (z.isNotEmpty) p['zip'] = z;
    if (radiusMiles != null && radiusMiles! > 0) p['radius'] = '$radiusMiles';
    return p;
  }

  static String _trimNum(double n) {
    if (n == n.roundToDouble()) return n.round().toString();
    return n.toString();
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuctionFilterState &&
        other.query == query &&
        other.sort == sort &&
        other.yearMin == yearMin &&
        other.yearMax == yearMax &&
        other.priceMinDollars == priceMinDollars &&
        other.priceMaxDollars == priceMaxDollars &&
        other.mileageMin == mileageMin &&
        other.mileageMax == mileageMax &&
        other.location == location &&
        other.conditionGrade == conditionGrade &&
        other.featuredOnly == featuredOnly &&
        other.noReserve == noReserve &&
        other.endingSoon == endingSoon &&
        other.status == status &&
        other.zip == zip &&
        other.radiusMiles == radiusMiles &&
        other.pageSize == pageSize;
  }

  @override
  int get hashCode => Object.hash(
        query,
        sort,
        yearMin,
        yearMax,
        priceMinDollars,
        priceMaxDollars,
        mileageMin,
        mileageMax,
        location,
        conditionGrade,
        featuredOnly,
        noReserve,
        endingSoon,
        status,
        zip,
        radiusMiles,
        pageSize,
      );
}
