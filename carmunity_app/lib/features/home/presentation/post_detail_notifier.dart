import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../shared/dto/post_detail_dto.dart';
import '../../../shared/state/providers.dart';

final postDetailNotifierProvider = StateNotifierProvider.autoDispose
    .family<PostDetailNotifier, AsyncValue<PostDetailDto>, String>(
  (ref, postId) => PostDetailNotifier(ref, postId),
);

class PostDetailNotifier extends StateNotifier<AsyncValue<PostDetailDto>> {
  PostDetailNotifier(this.ref, this.postId) : super(const AsyncValue.loading()) {
    _load();
  }

  final Ref ref;
  final String postId;

  Future<void> _load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(carmunityRepositoryProvider).fetchPostDetail(postId),
    );
  }

  Future<void> retry() => _load();

  Future<void> refreshSilently() async {
    final current = state.valueOrNull;
    if (current == null) return;
    try {
      final fresh = await ref.read(carmunityRepositoryProvider).fetchPostDetail(postId);
      state = AsyncValue.data(fresh);
    } catch (_) {}
  }

  Future<void> toggleLike() async {
    final v = state.valueOrNull;
    if (v == null) return;
    final repo = ref.read(carmunityRepositoryProvider);
    final optimistic = v.copyWith(
      liked: !v.liked,
      likeCount: v.liked ? (v.likeCount - 1).clamp(0, 1 << 30) : v.likeCount + 1,
    );
    state = AsyncValue.data(optimistic);
    try {
      final r = v.liked ? await repo.unlikePost(postId) : await repo.likePost(postId);
      state = AsyncValue.data(
        v.copyWith(liked: r.liked, likeCount: r.likeCount),
      );
    } on ApiException catch (_) {
      state = AsyncValue.data(v);
      rethrow;
    } catch (_) {
      state = AsyncValue.data(v);
      rethrow;
    }
  }

  Future<void> submitComment(String text) async {
    final v = state.valueOrNull;
    if (v == null) return;
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    await ref.read(carmunityRepositoryProvider).addComment(postId: postId, content: trimmed);
    await refreshSilently();
  }

  Future<void> toggleFollow() async {
    final v = state.valueOrNull;
    if (v == null) return;
    final repo = ref.read(carmunityRepositoryProvider);
    final next = !v.viewerFollowsAuthor;
    state = AsyncValue.data(v.copyWith(viewerFollowsAuthor: next));
    try {
      if (next) {
        await repo.followUser(v.authorId);
      } else {
        await repo.unfollowUser(v.authorId);
      }
    } on ApiException catch (_) {
      state = AsyncValue.data(v);
      rethrow;
    } catch (_) {
      state = AsyncValue.data(v);
      rethrow;
    }
  }
}
