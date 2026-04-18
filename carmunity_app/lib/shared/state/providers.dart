import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/media/api_carmunity_media_upload.dart';
import '../../core/media/carmunity_media_upload_port.dart';
import '../../core/media/media_picker_service.dart';
import '../../core/network/api_client.dart';
import '../../features/auth/data/carmunity_auth_repository.dart';
import '../../features/auctions/data/auction_repository.dart';
import '../../features/auctions/dto/auction_filter_state.dart';
import '../../features/auctions/dto/auction_watch_summary_dto.dart';
import '../../features/forums/data/forum_repository.dart';
import '../../features/forums/dto/forum_space_dto.dart';
import '../../features/home/data/carmunity_repository.dart';
import '../../shared/dto/carmunity_me_dto.dart';
import '../../shared/dto/demo_account_dto.dart';
import '../../shared/dto/post_summary.dart';
import '../services/auth_service.dart';

final authServiceProvider = ChangeNotifierProvider<AuthService>((ref) {
  return AuthService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final auth = ref.watch(authServiceProvider);
  return ApiClient(authService: auth);
});

final carmunityRepositoryProvider = Provider<CarmunityRepository>((ref) {
  return CarmunityRepository(client: ref.watch(apiClientProvider));
});

final auctionRepositoryProvider = Provider<AuctionRepository>((ref) {
  return AuctionRepository(client: ref.watch(apiClientProvider));
});

final carmunityAuthRepositoryProvider = Provider<CarmunityAuthRepository>((ref) {
  return CarmunityAuthRepository(client: ref.watch(apiClientProvider));
});

/// Browse filters for `GET /api/auctions/search` (Carmunity Auctions tab).
final auctionFilterProvider = StateProvider<AuctionFilterState>((ref) => const AuctionFilterState());

/// Saved auction ids for signed-in user (empty when guest / error).
final auctionWatchedIdsProvider = FutureProvider.autoDispose<Set<String>>((ref) async {
  final auth = ref.watch(authServiceProvider);
  if (!auth.canPerformMutations) return {};
  try {
    return await ref.read(auctionRepositoryProvider).fetchWatchlistAuctionIds();
  } catch (_) {
    return {};
  }
});

/// Full watchlist rows for Saved auctions screen.
final auctionWatchlistProvider = FutureProvider.autoDispose<List<AuctionWatchSummaryDto>>((ref) async {
  final auth = ref.watch(authServiceProvider);
  if (!auth.canPerformMutations) return [];
  return ref.read(auctionRepositoryProvider).fetchWatchlist();
});

final forumRepositoryProvider = Provider<ForumRepository>((ref) {
  return ForumRepository(client: ref.watch(apiClientProvider));
});

/// Active forum spaces (Mechanics Corner, Gear Interests, …).
final forumSpacesProvider = FutureProvider.autoDispose<List<ForumSpaceDto>>((ref) async {
  return ref.watch(forumRepositoryProvider).getSpaces();
});

/// Space detail with categories — key is API slug (e.g. mechanics-corner).
final forumSpaceDetailProvider =
    FutureProvider.autoDispose.family<ForumSpaceDetailDto, String>((ref, spaceSlug) async {
  return ref.watch(forumRepositoryProvider).getSpaceDetail(spaceSlug);
});

/// Photo upload — `POST /api/carmunity/media/upload` (multipart); see CARMUNITY_MEDIA_UPLOAD_CONTRACT.md.
final carmunityMediaUploadPortProvider = Provider<CarmunityMediaUploadPort>((ref) {
  return ApiCarmunityMediaUpload(client: ref.watch(apiClientProvider));
});

final mediaPickerServiceProvider = Provider<MediaPickerService>((ref) {
  return MediaPickerService();
});

/// Seeded demo sellers (development API only). Empty when unavailable.
final carmunityDemoAccountsProvider = FutureProvider.autoDispose<List<DemoAccountDto>>((ref) async {
  final repo = ref.watch(carmunityRepositoryProvider);
  return repo.fetchDemoAccounts();
});

/// Signed-in profile from `/api/carmunity/me` (requires session cookie or bearer).
final carmunityMeProvider = FutureProvider.autoDispose<CarmunityMeDto?>((ref) async {
  final auth = ref.watch(authServiceProvider);
  if (!auth.canPerformMutations) return null;
  final repo = ref.watch(carmunityRepositoryProvider);
  return repo.fetchMe();
});

/// Feed tab on Home — drives which API mode is used.
enum HomeFeedKind {
  following,
  trending,
  latest,
}

final homeFeedKindProvider = StateProvider<HomeFeedKind>((ref) => HomeFeedKind.trending);

final homeFeedProvider = FutureProvider.autoDispose<List<PostSummary>>((ref) async {
  final kind = ref.watch(homeFeedKindProvider);
  final repo = ref.watch(carmunityRepositoryProvider);
  final auth = ref.watch(authServiceProvider);

  switch (kind) {
    case HomeFeedKind.trending:
      return repo.fetchTrending(userIdForLiked: auth.userId);
    case HomeFeedKind.following:
      final uid = auth.userId;
      if (uid == null) return [];
      return repo.fetchFollowing(userId: uid);
    case HomeFeedKind.latest:
      return [];
  }
});
