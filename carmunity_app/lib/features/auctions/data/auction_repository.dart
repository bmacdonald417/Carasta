import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_exception.dart';
import '../dto/auction_detail_dto.dart';
import '../dto/auction_filter_state.dart';
import '../dto/auction_search_page_dto.dart';
import '../dto/auction_watch_summary_dto.dart';

/// Auction discovery — Carasta JSON APIs only (`AUCTION_SEARCH_ARCHITECTURE.md`).
class AuctionRepository {
  AuctionRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  static const _searchPath = '/api/auctions/search';

  Future<AuctionSearchPageDto> searchAuctions(AuctionFilterState filter, {required int page}) async {
    final params = filter.toQueryParams(page: page);
    final res = await _client.get<Map<String, dynamic>>(
      _searchPath,
      queryParameters: params,
    );
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Search failed',
        statusCode: res.statusCode,
      );
    }
    return AuctionSearchPageDto.fromJson(data);
  }

  Future<AuctionDetailDto> getAuctionDetail(String id) async {
    final res = await _client.get<Map<String, dynamic>>('/api/auctions/$id');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['error'] == 'Not found') {
      throw ApiException(message: 'Auction not found', statusCode: 404);
    }
    if (data['ok'] != true && data['id'] == null) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Invalid auction response',
        statusCode: res.statusCode,
      );
    }
    return AuctionDetailDto.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> watchAuction(String auctionId) async {
    final res = await _client.post<Map<String, dynamic>>('/api/auctions/$auctionId/watch');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Could not save auction',
        statusCode: res.statusCode,
      );
    }
  }

  Future<void> unwatchAuction(String auctionId) async {
    final res = await _client.delete<Map<String, dynamic>>('/api/auctions/$auctionId/watch');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Could not remove save',
        statusCode: res.statusCode,
      );
    }
  }

  Future<List<AuctionWatchSummaryDto>> fetchWatchlist() async {
    final res = await _client.get<Map<String, dynamic>>('/api/carmunity/watchlist');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Could not load watchlist',
        statusCode: res.statusCode,
      );
    }
    final raw = data['items'];
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((e) => AuctionWatchSummaryDto.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<Set<String>> fetchWatchlistAuctionIds() async {
    final res = await _client.get<Map<String, dynamic>>('/api/carmunity/watchlist');
    final data = res.data;
    if (data == null) {
      throw ApiException(message: 'Empty response', statusCode: res.statusCode);
    }
    if (data['ok'] != true) {
      final err = data['error'];
      throw ApiException(
        message: err is String ? err : 'Could not load watchlist',
        statusCode: res.statusCode,
      );
    }
    final raw = data['auctionIds'];
    if (raw is! List) return {};
    return raw.whereType<String>().toSet();
  }
}
