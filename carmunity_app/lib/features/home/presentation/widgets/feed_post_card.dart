import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../shared/dto/post_summary.dart';
import '../../../../shared/state/providers.dart';

/// Media-first feed tile — tappable body opens detail; like is optimistic + API-backed.
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final time = DateFormat.MMMd().add_jm().format(widget.post.createdAt.toLocal());
    final hasImage = widget.post.imageUrl != null && widget.post.imageUrl!.trim().isNotEmpty;
    final hasContent = widget.post.content != null && widget.post.content!.trim().isNotEmpty;

    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.vertical(
                top: const Radius.circular(AppSpacing.radiusMd),
                bottom: Radius.zero,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      AppSpacing.md,
                      AppSpacing.md,
                      AppSpacing.sm,
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
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
                              Text(
                                widget.post.author.displayName,
                                style: theme.textTheme.titleSmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '@${widget.post.author.handle} · $time',
                                style: theme.textTheme.bodySmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        if (widget.post.auctionId != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                              vertical: AppSpacing.xxs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                              border: Border.all(color: AppColors.borderSubtle),
                            ),
                            child: Text(
                              'Listing',
                              style: theme.textTheme.labelMedium?.copyWith(color: AppColors.accent),
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (hasImage)
                    AspectRatio(
                      aspectRatio: 16 / 10,
                      child: Image.network(
                        widget.post.imageUrl!.trim(),
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            color: AppColors.imagePlaceholder,
                            alignment: Alignment.center,
                            child: const CircularProgressIndicator(strokeWidth: 2),
                          );
                        },
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.imagePlaceholder,
                          alignment: Alignment.center,
                          child: Icon(Icons.broken_image_outlined, color: AppColors.textTertiary),
                        ),
                      ),
                    ),
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
                        style: theme.textTheme.bodyLarge,
                        maxLines: hasImage ? 5 : 12,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xs,
                AppSpacing.xs,
                AppSpacing.md,
                AppSpacing.md,
              ),
              child: Row(
                children: [
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    onPressed: _likeBusy ? null : _toggleLike,
                    icon: _likeBusy
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(
                            _liked ? Icons.favorite : Icons.favorite_border,
                            size: 22,
                            color: _liked ? AppColors.accent : AppColors.textSecondary,
                          ),
                  ),
                  Text('$_likeCount', style: theme.textTheme.bodySmall),
                  const SizedBox(width: AppSpacing.md),
                  Icon(Icons.chat_bubble_outline, size: 18, color: AppColors.textSecondary),
                  const SizedBox(width: AppSpacing.xxs),
                  Text('${widget.post.commentCount}', style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
