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
        loading: () => ListView(
              padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
              children: const [
                SizedBox(height: AppSpacing.sm),
                _ForumSkeletonRow(),
                SizedBox(height: AppSpacing.md),
                _ForumSkeletonRow(),
                SizedBox(height: AppSpacing.md),
                _ForumSkeletonRow(),
              ],
            ),
        error: (e, _) => _ErrorBody(
          message: e is ApiException ? e.message : e.toString(),
          onRetry: () => ref.invalidate(forumSpacesProvider),
        ),
        data: (spaces) {
          if (spaces.isEmpty) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(h),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.forum_outlined, size: 44, color: AppColors.accent.withOpacity(0.85)),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        'Forums are warming up',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'Spaces appear when your Carasta deployment has forum data (e.g. prisma db seed). '
                        'Meanwhile, catch live chatter on Carmunity.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                              height: 1.45,
                            ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      FilledButton(
                        onPressed: () => context.push(AppRoutes.home),
                        child: const Text('Open Carmunity feed'),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      OutlinedButton(
                        onPressed: () => context.push(AppRoutes.createForumThread),
                        child: const Text('Draft a thread (create)'),
                      ),
                    ],
                  ),
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

class _ForumSkeletonRow extends StatelessWidget {
  const _ForumSkeletonRow();

  @override
  Widget build(BuildContext context) {
    final bar = BoxDecoration(
      color: AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(4),
    );
    return Container(
      height: 104,
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.borderSubtle.withOpacity(0.85)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 12, width: 160, decoration: bar),
                  const SizedBox(height: 10),
                  Container(height: 10, width: double.infinity, decoration: bar),
                  const SizedBox(height: 8),
                  Container(height: 10, width: 120, decoration: bar),
                ],
              ),
            ),
          ],
        ),
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
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        splashColor: AppColors.accent.withOpacity(0.1),
        highlightColor: AppColors.accent.withOpacity(0.04),
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
