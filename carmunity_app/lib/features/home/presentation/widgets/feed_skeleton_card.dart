import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';

final BoxDecoration _kSkeletonBar = BoxDecoration(
  color: AppColors.surfaceElevated,
  borderRadius: BorderRadius.circular(4),
);

/// Lightweight placeholder matching [FeedPostCard] proportions (no shimmer deps).
class FeedSkeletonCard extends StatelessWidget {
  const FeedSkeletonCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard.withOpacity(0.85),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.borderSubtle.withOpacity(0.9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, AppSpacing.sm),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.surfaceElevated),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(height: 12, width: 140, decoration: _kSkeletonBar),
                      const SizedBox(height: 8),
                      Container(height: 10, width: 96, decoration: _kSkeletonBar),
                    ],
                  ),
                ),
              ],
            ),
          ),
          AspectRatio(
            aspectRatio: 4 / 3,
            child: Container(color: AppColors.imagePlaceholder.withOpacity(0.35)),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 10, width: double.infinity, decoration: _kSkeletonBar),
                const SizedBox(height: 8),
                Container(height: 10, width: 220, decoration: _kSkeletonBar),
              ],
            ),
          ),
          const Divider(height: 1, thickness: 1, color: AppColors.borderSubtle),
          const SizedBox(height: AppSpacing.sm),
        ],
      ),
    );
  }
}
