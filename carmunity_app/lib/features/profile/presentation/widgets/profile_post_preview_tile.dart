import 'dart:ui' show FontFeature;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../shared/dto/carmunity_me_dto.dart';

/// Profile post shell — aligns with [FeedPostCard] / web explore card language (read-only stats).
class ProfilePostPreviewTile extends StatelessWidget {
  const ProfilePostPreviewTile({required this.post, super.key});

  final CarmunityRecentPostDto post;

  String _relativeTime(BuildContext context, DateTime t) {
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
    final hasImage = post.imageUrl != null && post.imageUrl!.trim().isNotEmpty;
    final hasContent = post.content != null && post.content!.trim().isNotEmpty;
    final t = post.createdAt;
    final meta = t != null ? _relativeTime(context, t.toLocal()) : 'Post';

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
              onTap: () => context.push(AppRoutes.postDetail(post.id)),
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
                        if (post.auctionId != null)
                          Container(
                            margin: const EdgeInsets.only(right: AppSpacing.sm),
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.auctionSignal.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                              border: Border.all(color: AppColors.auctionSignal.withOpacity(0.35)),
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
                        Expanded(
                          child: Text(
                            meta,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          'View',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (hasImage)
                    AspectRatio(
                      aspectRatio: 4 / 3,
                      child: Image.network(
                        post.imageUrl!.trim(),
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.imagePlaceholder,
                          alignment: Alignment.center,
                          child: const Icon(Icons.broken_image_outlined, color: AppColors.textTertiary),
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
                        style: theme.textTheme.bodyLarge?.copyWith(
                          height: 1.45,
                          color: AppColors.textPrimary.withOpacity(0.92),
                        ),
                        maxLines: hasImage ? 6 : 10,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ),
            const Divider(height: 1, thickness: 1, color: AppColors.borderSubtle),
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xs, AppSpacing.md, AppSpacing.sm),
              child: Row(
                children: [
                  Icon(Icons.favorite_border_rounded, size: 20, color: AppColors.textTertiary),
                  const SizedBox(width: AppSpacing.xxs),
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
    );
  }
}
