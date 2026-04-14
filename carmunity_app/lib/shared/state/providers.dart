import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/media/carmunity_media_upload_port.dart';
import '../../core/media/media_picker_service.dart';
import '../../core/media/staged_carmunity_media_upload.dart';
import '../../core/network/api_client.dart';
import '../../features/auctions/data/auction_repository.dart';
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

/// Photo upload: Phase 3 uses [StagedCarmunityMediaUpload] until backend presign/upload exists.
final carmunityMediaUploadPortProvider = Provider<CarmunityMediaUploadPort>((ref) {
  return const StagedCarmunityMediaUpload();
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
