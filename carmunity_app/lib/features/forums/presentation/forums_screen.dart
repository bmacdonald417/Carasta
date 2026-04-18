import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../dto/forum_space_dto.dart';

/// Forums tab — real spaces from `GET /api/forums/spaces`.
class ForumsScreen extends ConsumerWidget {
  const ForumsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(forumSpacesProvider);
    final h = pageHorizontalPadding(context);
    final wide = MediaQuery.sizeOf(context).width >= 900;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Forums'),
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorBody(
          message: e is ApiException ? e.message : e.toString(),
          onRetry: () => ref.invalidate(forumSpacesProvider),
        ),
        data: (spaces) {
          if (spaces.isEmpty) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(h),
                child: Text(
                  'No forum spaces yet. Start Carasta with a seeded database (prisma db seed).',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                ),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(forumSpacesProvider);
              await ref.read(forumSpacesProvider.future);
            },
            child: ListView(
              padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
              children: [
                Text(
                  'Community spaces',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Mechanics Corner for technical depth. Gear Interests for culture, kit, and brand stories.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: AppSpacing.xl),
                if (wide)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (var i = 0; i < spaces.length; i++) ...[
                        Expanded(child: _SpaceHeroCard(space: spaces[i])),
                        if (i != spaces.length - 1) const SizedBox(width: AppSpacing.md),
                      ],
                    ],
                  )
                else
                  ...spaces.map((s) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: _SpaceHeroCard(space: s),
                      )),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off_outlined, size: 48, color: AppColors.textTertiary),
            const SizedBox(height: AppSpacing.md),
            Text('Could not load forums', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onRetry, child: const Text('Try again')),
          ],
        ),
      ),
    );
  }
}

class _SpaceHeroCard extends StatelessWidget {
  const _SpaceHeroCard({required this.space});

  final ForumSpaceDto space;

  bool get _isMechanics =>
      space.slug.contains('mechanics') || space.title.toLowerCase().contains('mechanic');

  @override
  Widget build(BuildContext context) {
    final accent = _isMechanics ? const Color(0xFF5B8FC7) : AppColors.accent;
    final icon = _isMechanics ? Icons.build_circle_outlined : Icons.style_outlined;
    final vibe = _isMechanics
        ? 'Diagnostics, wrenching, and shop talk — problem-solving first.'
        : 'Watches, apparel, tools, and lifestyle — enthusiast energy.';

    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(AppRoutes.forumSpace(space.slug)),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            border: Border.all(color: AppColors.borderSubtle),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.surfaceElevated,
                AppColors.surfaceCard,
              ],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 6,
                color: accent.withValues(alpha: 0.85),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                        border: Border.all(color: accent.withValues(alpha: 0.35)),
                      ),
                      child: Icon(icon, color: accent, size: 32),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(space.title, style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            space.description?.trim().isNotEmpty == true ? space.description!.trim() : vibe,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            '${space.categoryCount} categories',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
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
