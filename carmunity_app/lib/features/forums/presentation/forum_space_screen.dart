import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../dto/forum_category_dto.dart';

/// Categories inside a forum space (`GET /api/forums/spaces/[slug]`).
class ForumSpaceScreen extends ConsumerWidget {
  const ForumSpaceScreen({super.key, required this.spaceSlug});

  final String spaceSlug;

  bool get _isMechanics =>
      spaceSlug.contains('mechanics') || spaceSlug.contains('mechanic');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(forumSpaceDetailProvider(spaceSlug));
    final h = pageHorizontalPadding(context);
    final accent = _isMechanics ? const Color(0xFF5B8FC7) : AppColors.accent;
    final headline = _isMechanics
        ? 'Technical discussion — bring symptoms, codes, and context.'
        : 'Brand, kit, and culture — what are you into right now?';

    return Scaffold(
      appBar: AppBar(
        title: async.maybeWhen(
          data: (s) => Text(s.title),
          orElse: () => const Text('Forum space'),
        ),
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(e is ApiException ? e.message : e.toString(), textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.md),
                FilledButton(
                  onPressed: () => ref.invalidate(forumSpaceDetailProvider(spaceSlug)),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
        data: (space) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(forumSpaceDetailProvider(spaceSlug));
              await ref.read(forumSpaceDetailProvider(spaceSlug).future);
            },
            child: ListView(
              padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    border: Border.all(color: accent.withValues(alpha: 0.35)),
                    color: accent.withValues(alpha: 0.08),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _isMechanics ? Icons.handyman_outlined : Icons.local_fire_department_outlined,
                        color: accent,
                        size: 28,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              space.description?.trim().isNotEmpty == true
                                  ? space.description!.trim()
                                  : headline,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text('Categories', style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: AppSpacing.sm),
                if (space.categories.isEmpty)
                  Text(
                    'No categories yet.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                  )
                else
                  ...space.categories.map((c) => _CategoryTile(
                        category: c,
                        accent: accent,
                        onOpen: () => context.push(AppRoutes.forumCategoryThreads(c.id)),
                      )),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.category,
    required this.accent,
    required this.onOpen,
  });

  final ForumCategoryDto category;
  final Color accent;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: InkWell(
          onTap: onOpen,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Icon(Icons.forum_outlined, color: accent, size: 22),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(category.title, style: Theme.of(context).textTheme.titleSmall),
                        if (category.description != null && category.description!.trim().isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xxs),
                          Text(
                            category.description!.trim(),
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                          ),
                        ],
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '${category.threadCount} threads',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
