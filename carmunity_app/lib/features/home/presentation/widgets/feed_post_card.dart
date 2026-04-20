import 'dart:ui' show FontFeature;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../shared/dto/post_summary.dart';
import '../../../../shared/state/providers.dart';

/// Carmunity feed tile — hierarchy aligned with web `community-feed.tsx` PostCard.
class FeedPostCard extends ConsumerStatefulWidget {
  const FeedPostCard({
    required this.post,
    super.key,
    this.onTap,
    this.onEngagementChanged,
  });

  final PostSummary post;
  final VoidCallback? onTap;
  final VoidCallback? onEngagementChanged;

  @override
  ConsumerState<FeedPostCard> createState() => _FeedPostCardState();
}

class _FeedPostCardState extends ConsumerState<FeedPostCard> {
  bool? _likedOverride;
  int? _likeCountOverride;
  bool _likeBusy = false;

  bool get _liked => _likedOverride ?? widget.post.liked;
  int get _likeCount => _likeCountOverride ?? widget.post.likeCount;

  @override
  void didUpdateWidget(covariant FeedPostCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.post.id != widget.post.id) {
      _likedOverride = null;
      _likeCountOverride = null;
    }
  }

  Future<void> _toggleLike() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      ScaffoldMessenger.maybeOf(context)?.showSnackBar(
        const SnackBar(
          content: Text('Sign in required — use You → Developer session or DEV_* defines.'),
        ),
      );
      return;
    }
    if (_likeBusy) return;
    final was = _liked;
    final prevCount = _likeCount;
    setState(() {
      _likeBusy = true;
      _likedOverride = !was;
      _likeCountOverride = was ? (prevCount - 1).clamp(0, 1 << 30) : prevCount + 1;
    });
    try {
      final repo = ref.read(carmunityRepositoryProvider);
      final r = was ? await repo.unlikePost(widget.post.id) : await repo.likePost(widget.post.id);
      setState(() {
        _likedOverride = r.liked;
        _likeCountOverride = r.likeCount;
      });
      widget.onEngagementChanged?.call();
    } on ApiException catch (e) {
      setState(() {
        _likedOverride = was;
        _likeCountOverride = prevCount;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } catch (e) {
      setState(() {
        _likedOverride = was;
        _likeCountOverride = prevCount;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _likeBusy = false);
    }
  }

  String _relativeTime(DateTime t) {
    final diff = DateTime.now().difference(t);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return MaterialLocalizations.of(context).formatShortDate(t.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasImage = widget.post.imageUrl != null && widget.post.imageUrl!.trim().isNotEmpty;
    final hasContent = widget.post.content != null && widget.post.content!.trim().isNotEmpty;
    final meta = '@${widget.post.author.handle} · ${_relativeTime(widget.post.createdAt.toLocal())}';

    return Material(
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
            InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              splashColor: AppColors.accent.withOpacity(0.12),
              highlightColor: AppColors.accent.withOpacity(0.05),
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
                          backgroundImage: widget.post.author.avatarUrl != null &&
                                  widget.post.author.avatarUrl!.isNotEmpty
                              ? NetworkImage(widget.post.author.avatarUrl!)
                              : null,
                          child: widget.post.author.avatarUrl == null ||
                                  widget.post.author.avatarUrl!.isEmpty
                              ? Text(
                                  widget.post.author.handle.isNotEmpty
                                      ? widget.post.author.handle[0].toUpperCase()
                                      : '?',
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
                                      widget.post.author.displayName,
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: -0.2,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (widget.post.auctionId != null)
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
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // 2 — Media (edge-to-edge, image-forward)
                  if (hasImage)
                    AspectRatio(
                      aspectRatio: 4 / 3,
                      child: Image.network(
                        widget.post.imageUrl!.trim(),
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
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

                  // 3 — Caption
                  if (hasContent)
                    Padding(
                      padding: EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        hasImage ? AppSpacing.sm : 0,
                        AppSpacing.md,
                        AppSpacing.sm,
                      ),
                      child: Text(
                        widget.post.content!.trim(),
                        style: theme.textTheme.bodyLarge?.copyWith(
                          height: 1.45,
                          color: AppColors.textPrimary.withOpacity(0.92),
                        ),
                        maxLines: hasImage ? 6 : 12,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ),

            const Divider(height: 1, thickness: 1, color: AppColors.borderSubtle),

            // 5 — Actions (separate from body tap target)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xs,
                AppSpacing.xs,
                AppSpacing.md,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Tooltip(
                    message: 'Like',
                    child: IconButton(
                      visualDensity: VisualDensity.compact,
                      splashRadius: 22,
                      style: IconButton.styleFrom(
                        foregroundColor: _liked ? AppColors.accent : AppColors.textSecondary,
                      ),
                      onPressed: _likeBusy ? null : _toggleLike,
                      icon: _likeBusy
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : AnimatedScale(
                              scale: _liked ? 1.06 : 1,
                              duration: const Duration(milliseconds: 140),
                              curve: Curves.easeOut,
                              child: Icon(
                                _liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                size: 22,
                              ),
                            ),
                    ),
                  ),
                  Text(
                    '$_likeCount',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: AppColors.textSecondary,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Icon(Icons.chat_bubble_outline_rounded, size: 20, color: AppColors.textTertiary),
                  const SizedBox(width: AppSpacing.xxs),
                  Text(
                    '${widget.post.commentCount}',
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
    );
  }
}
