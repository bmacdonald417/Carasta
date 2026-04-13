import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../shared/dto/post_summary.dart';

/// Media-first feed tile — image prominent when present.
class FeedPostCard extends StatelessWidget {
  const FeedPostCard({
    required this.post,
    super.key,
    this.onTap,
  });

  final PostSummary post;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final time = DateFormat.MMMd().add_jm().format(post.createdAt.toLocal());
    final hasImage = post.imageUrl != null && post.imageUrl!.trim().isNotEmpty;
    final hasContent = post.content != null && post.content!.trim().isNotEmpty;

    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: AppColors.borderSubtle),
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
                      backgroundImage: post.author.avatarUrl != null &&
                              post.author.avatarUrl!.isNotEmpty
                          ? NetworkImage(post.author.avatarUrl!)
                          : null,
                      child: post.author.avatarUrl == null || post.author.avatarUrl!.isEmpty
                          ? Text(
                              post.author.handle.isNotEmpty
                                  ? post.author.handle[0].toUpperCase()
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
                            post.author.displayName,
                            style: theme.textTheme.titleSmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '@${post.author.handle} · $time',
                            style: theme.textTheme.bodySmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (post.auctionId != null)
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
                    post.imageUrl!.trim(),
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
                    post.content!.trim(),
                    style: theme.textTheme.bodyLarge,
                    maxLines: hasImage ? 5 : 12,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.xs,
                  AppSpacing.md,
                  AppSpacing.md,
                ),
                child: Row(
                  children: [
                    Icon(Icons.favorite_border, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: AppSpacing.xxs),
                    Text('${post.likeCount}', style: theme.textTheme.bodySmall),
                    const SizedBox(width: AppSpacing.md),
                    Icon(Icons.chat_bubble_outline, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: AppSpacing.xxs),
                    Text('${post.commentCount}', style: theme.textTheme.bodySmall),
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
