import 'dart:ui' show FontFeature;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/dto/post_detail_dto.dart';
import '../../../shared/services/auth_service.dart';
import '../../../shared/state/providers.dart';
import 'post_detail_notifier.dart';
import 'widgets/sign_in_required_hint.dart';

class PostDetailScreen extends ConsumerStatefulWidget {
  const PostDetailScreen({required this.postId, super.key});

  final String postId;

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  final _commentController = TextEditingController();
  bool _submittingComment = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _snack(String message, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.error : null,
      ),
    );
  }

  Future<void> _guardMutations(AuthService auth, Future<void> Function() action) async {
    if (!auth.canPerformMutations) {
      _snack('Sign in required — open You → Developer session or set DEV_* defines.', error: true);
      return;
    }
    try {
      await action();
    } on ApiException catch (e) {
      if (e.isUnauthorized) {
        _snack('Session expired or unauthorized. Update your session.', error: true);
      } else {
        _snack(e.message, error: true);
      }
    } catch (e) {
      _snack(e.toString(), error: true);
    }
  }

  String _relativeTime(DateTime t) {
    final diff = DateTime.now().difference(t);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat.yMMMd().add_jm().format(t.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    final auth = ref.watch(authServiceProvider);
    final async = ref.watch(postDetailNotifierProvider(widget.postId));
    final notifier = ref.read(postDetailNotifierProvider(widget.postId).notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Post'),
      ),
      body: async.when(
        data: (post) => _buildBody(
          context,
          post: post,
          auth: auth,
          horizontalPadding: h,
          notifier: notifier,
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: EdgeInsets.all(h),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.cloud_off_outlined, size: 48, color: AppColors.textTertiary),
                const SizedBox(height: AppSpacing.md),
                Text(
                  e is ApiException ? e.message : e.toString(),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton.tonal(
                  onPressed: () => notifier.retry(),
                  child: const Text('Try again'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context, {
    required PostDetailDto post,
    required AuthService auth,
    required double horizontalPadding,
    required PostDetailNotifier notifier,
  }) {
    final theme = Theme.of(context);
    final meta = '@${post.author.handle} · ${_relativeTime(post.createdAt.toLocal())}';
    final isSelf = auth.userId != null && auth.userId == post.authorId;
    final hasImage = post.imageUrl != null && post.imageUrl!.trim().isNotEmpty;
    final hasContent = post.content != null && post.content!.trim().isNotEmpty;

    return ListView(
      padding: EdgeInsets.fromLTRB(horizontalPadding, AppSpacing.md, horizontalPadding, AppSpacing.xxl),
      children: [
        if (!auth.canPerformMutations) const SignInRequiredHint(),
        Material(
          color: AppColors.surfaceCard.withOpacity(0.92),
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          clipBehavior: Clip.antiAlias,
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              border: Border.all(color: AppColors.borderSubtle.withOpacity(0.9)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1 — Author row
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.sm,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: AppColors.surfaceElevated,
                        backgroundImage: post.author.avatarUrl != null && post.author.avatarUrl!.isNotEmpty
                            ? NetworkImage(post.author.avatarUrl!)
                            : null,
                        child: post.author.avatarUrl == null || post.author.avatarUrl!.isEmpty
                            ? Text(
                                post.author.handle.isNotEmpty ? post.author.handle[0].toUpperCase() : '?',
                                style: theme.textTheme.titleSmall,
                              )
                            : null,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    post.author.displayName,
                                    style: theme.textTheme.titleSmall?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: -0.2,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (post.auctionId != null)
                                  Container(
                                    margin: const EdgeInsets.only(left: AppSpacing.xs),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.sm,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.auctionSignal.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                                      border: Border.all(
                                        color: AppColors.auctionSignal.withOpacity(0.35),
                                      ),
                                    ),
                                    child: Text(
                                      'Auction',
                                      style: theme.textTheme.labelSmall?.copyWith(
                                        color: AppColors.auctionSignal,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.4,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              meta,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: AppColors.textTertiary,
                                fontSize: 12,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      if (!isSelf)
                        FilledButton.tonal(
                          style: FilledButton.styleFrom(
                            visualDensity: VisualDensity.compact,
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                          ),
                          onPressed: () => _guardMutations(auth, () => notifier.toggleFollow()),
                          child: Text(post.viewerFollowsAuthor ? 'Following' : 'Follow'),
                        ),
                    ],
                  ),
                ),

                // 2 — Media (image-forward, matches feed)
                if (hasImage)
                  AspectRatio(
                    aspectRatio: 4 / 3,
                    child: Image.network(
                      post.imageUrl!.trim(),
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, p) {
                        if (p == null) return child;
                        return Container(
                          color: AppColors.imagePlaceholder,
                          alignment: Alignment.center,
                          child: const SizedBox(
                            width: 28,
                            height: 28,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        );
                      },
                      errorBuilder: (_, __, ___) => Container(
                        color: AppColors.imagePlaceholder,
                        alignment: Alignment.center,
                        child: const Icon(Icons.broken_image_outlined, color: AppColors.textTertiary),
                      ),
                    ),
                  ),

                // 3 — Body
                if (hasContent)
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      hasImage ? AppSpacing.sm : 0,
                      AppSpacing.md,
                      AppSpacing.sm,
                    ),
                    child: Text(
                      post.content!.trim(),
                      style: theme.textTheme.bodyLarge?.copyWith(
                        height: 1.45,
                        color: AppColors.textPrimary.withOpacity(0.92),
                      ),
                    ),
                  ),

                const Divider(height: 1, thickness: 1, color: AppColors.borderSubtle),

                // 4 — Engagement row (copper like state; counts only)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.xs,
                    AppSpacing.xs,
                    AppSpacing.md,
                    AppSpacing.sm,
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        style: IconButton.styleFrom(
                          foregroundColor: post.liked ? AppColors.accent : AppColors.textSecondary,
                        ),
                        onPressed: () => _guardMutations(auth, () => notifier.toggleLike()),
                        icon: Icon(
                          post.liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          size: 22,
                        ),
                      ),
                      Text(
                        '${post.likeCount}',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: AppColors.textSecondary,
                          fontFeatures: const [FontFeature.tabularFigures()],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Icon(Icons.chat_bubble_outline_rounded, size: 20, color: AppColors.textTertiary),
                      const SizedBox(width: AppSpacing.xxs),
                      Text(
                        '${post.commentCount}',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: AppColors.textSecondary,
                          fontFeatures: const [FontFeature.tabularFigures()],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.lg),
        Text(
          'Comments',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
            letterSpacing: -0.2,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (post.comments.isEmpty)
          Text(
            'No comments yet. Be the first.',
            style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          )
        else
          ...post.comments.map((c) => _CommentTile(comment: c)),
        const SizedBox(height: AppSpacing.lg),
        if (auth.canPerformMutations) ...[
          TextField(
            controller: _commentController,
            minLines: 2,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Add a comment…',
              filled: true,
              fillColor: AppColors.surfaceElevated.withOpacity(0.5),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                borderSide: BorderSide(color: AppColors.borderSubtle.withOpacity(0.9)),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Align(
            alignment: Alignment.centerRight,
            child: FilledButton(
              onPressed: _submittingComment
                  ? null
                  : () async {
                      await _guardMutations(auth, () async {
                        setState(() => _submittingComment = true);
                        try {
                          await notifier.submitComment(_commentController.text);
                          _commentController.clear();
                          ref.invalidate(homeFeedProvider);
                        } finally {
                          if (mounted) setState(() => _submittingComment = false);
                        }
                      });
                    },
              child: _submittingComment
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Post comment'),
            ),
          ),
        ] else
          Text(
            'Comments are read-only until you add a session.',
            style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
          ),
      ],
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});

  final CommentDto comment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = DateFormat.MMMd().add_jm().format(comment.createdAt.toLocal());
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: AppColors.borderSubtle.withOpacity(0.85)),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(0, 0, 0, AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surfaceElevated,
                backgroundImage: comment.author.avatarUrl != null && comment.author.avatarUrl!.isNotEmpty
                    ? NetworkImage(comment.author.avatarUrl!)
                    : null,
                child: comment.author.avatarUrl == null || comment.author.avatarUrl!.isEmpty
                    ? Text(
                        comment.author.handle.isNotEmpty ? comment.author.handle[0].toUpperCase() : '?',
                        style: theme.textTheme.bodySmall,
                      )
                    : null,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '@${comment.author.handle}',
                      style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(comment.content, style: theme.textTheme.bodyMedium),
                    const SizedBox(height: 4),
                    Text(
                      t,
                      style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textTertiary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
