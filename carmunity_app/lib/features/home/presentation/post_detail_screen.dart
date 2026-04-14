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
    final time = DateFormat.yMMMd().add_jm().format(post.createdAt.toLocal());
    final isSelf = auth.userId != null && auth.userId == post.authorId;

    return ListView(
      padding: EdgeInsets.fromLTRB(horizontalPadding, AppSpacing.md, horizontalPadding, AppSpacing.xxl),
      children: [
        if (!auth.canPerformMutations) const SignInRequiredHint(),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 24,
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
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(post.author.displayName, style: theme.textTheme.titleSmall),
                  Text('@${post.author.handle}', style: theme.textTheme.bodySmall),
                  Text(time, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
            if (!isSelf)
              FilledButton.tonal(
                onPressed: () => _guardMutations(auth, () => notifier.toggleFollow()),
                child: Text(post.viewerFollowsAuthor ? 'Following' : 'Follow'),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        if (post.content != null && post.content!.trim().isNotEmpty)
          Text(post.content!, style: theme.textTheme.bodyLarge),
        if (post.imageUrl != null && post.imageUrl!.trim().isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: AspectRatio(
              aspectRatio: 16 / 10,
              child: Image.network(
                post.imageUrl!.trim(),
                fit: BoxFit.cover,
                loadingBuilder: (context, child, p) {
                  if (p == null) return child;
                  return Container(
                    color: AppColors.imagePlaceholder,
                    alignment: Alignment.center,
                    child: const CircularProgressIndicator(strokeWidth: 2),
                  );
                },
                errorBuilder: (_, __, ___) => Container(
                  color: AppColors.imagePlaceholder,
                  height: 200,
                  alignment: Alignment.center,
                  child: const Icon(Icons.broken_image_outlined),
                ),
              ),
            ),
          ),
        ],
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            IconButton.filledTonal(
              onPressed: () => _guardMutations(auth, () => notifier.toggleLike()),
              icon: Icon(post.liked ? Icons.favorite : Icons.favorite_border),
            ),
            const SizedBox(width: AppSpacing.xs),
            Text('${post.likeCount}', style: theme.textTheme.titleSmall),
            const SizedBox(width: AppSpacing.lg),
            Icon(Icons.chat_bubble_outline, color: AppColors.textSecondary, size: 22),
            const SizedBox(width: AppSpacing.xs),
            Text('${post.commentCount}', style: theme.textTheme.titleSmall),
          ],
        ),
        const Divider(height: AppSpacing.xxl),
        Text('Comments', style: theme.textTheme.titleMedium),
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
            decoration: const InputDecoration(
              hintText: 'Add a comment…',
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
          border: Border.all(color: AppColors.borderSubtle),
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          color: AppColors.surfaceCard,
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surfaceElevated,
                backgroundImage: comment.author.avatarUrl != null &&
                        comment.author.avatarUrl!.isNotEmpty
                    ? NetworkImage(comment.author.avatarUrl!)
                    : null,
                child: comment.author.avatarUrl == null || comment.author.avatarUrl!.isEmpty
                    ? Text(
                        comment.author.handle.isNotEmpty
                            ? comment.author.handle[0].toUpperCase()
                            : '?',
                        style: theme.textTheme.bodySmall,
                      )
                    : null,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('@${comment.author.handle}', style: theme.textTheme.titleSmall),
                    Text(comment.content, style: theme.textTheme.bodyMedium),
                    Text(t, style: theme.textTheme.bodySmall),
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
