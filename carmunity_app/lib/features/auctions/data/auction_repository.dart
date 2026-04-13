import '../../../../core/network/api_client.dart';

/// Auction discovery — `GET /api/auctions/search` will be wired in a later slice.
class AuctionRepository {
  AuctionRepository({required ApiClient client}) : _client = client;

  final ApiClient _client;

  /// Placeholder for browse; returns empty until Phase 2 wires search + DTO mapping.
  Future<void> prefetchBrowsePlaceholder() async {
    // Intentionally no-op — avoids speculative parsing.
    await Future<void>.delayed(Duration.zero);
  }

  ApiClient get client => _client;
}
