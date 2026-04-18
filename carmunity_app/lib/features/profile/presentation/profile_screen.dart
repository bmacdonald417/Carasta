import 'dart:ui' show FontFeature;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/dto/carmunity_me_dto.dart';
import '../../../shared/state/providers.dart';
import 'carmunity_demo_sign_in.dart';
import 'widgets/profile_post_preview_tile.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You', style: Theme.of(context).textTheme.titleLarge),
            Text(
              'Carmunity profile',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Settings',
            onPressed: () => context.push(AppRoutes.settings),
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: !auth.canPerformMutations
          ? _GuestBody(ref: ref)
          : ref.watch(carmunityMeProvider).when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => _ProfileErrorBody(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(carmunityMeProvider),
                ),
                data: (me) {
                  if (me == null) {
                    return _ProfileMissingSessionBody(
                      onClear: () {
                        ref.read(authServiceProvider).clearSession();
                        ref.invalidate(carmunityMeProvider);
                        ref.invalidate(homeFeedProvider);
                        ref.invalidate(auctionWatchedIdsProvider);
                        ref.invalidate(auctionWatchlistProvider);
                      },
                    );
                  }
                  return _SignedInBody(me: me);
                },
              ),
    );
  }
}

class _GuestBody extends StatelessWidget {
  const _GuestBody({required this.ref});

  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
      children: [
        _ProfileShellCard(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CircleAvatar(
                radius: 36,
                backgroundColor: AppColors.surfaceElevated,
                child: Icon(Icons.person_rounded, size: 36, color: AppColors.textSecondary),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your profile',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.5,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      '@handle',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textTertiary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Sign in to load your Carasta profile, garage, and posts.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.45,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _ActionRow(
          children: [
            if (showCarmunityDemoSignInUi())
              FilledButton.tonal(
                onPressed: () => showCarmunityDemoSignInSheet(context, ref),
                child: const Text('Demo sign-in'),
              ),
            OutlinedButton(
              onPressed: () => context.push(AppRoutes.devSession),
              child: const Text('Developer session'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        _StatStrip(
          stats: const [
            _StatData('Posts', '—'),
            _StatData('Followers', '—'),
            _StatData('Following', '—'),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        _SectionLabel(context, 'Garage', 'Collection lives on your Carasta profile'),
        const SizedBox(height: AppSpacing.sm),
        _GarageShowcaseCard(
          count: 0,
          subtitle: 'Dream cars and owned rides — open the full garage on the web.',
          onOpen: () => context.push(AppRoutes.garage),
        ),
        const SizedBox(height: AppSpacing.xl),
        _SectionLabel(context, 'Posts', 'Carmunity updates'),
        const SizedBox(height: AppSpacing.sm),
        const _EmptyPostHint(),
      ],
    );
  }
}

class _SignedInBody extends StatelessWidget {
  const _SignedInBody({required this.me});

  final CarmunityMeDto me;

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    final displayName = me.name?.trim().isNotEmpty == true ? me.name!.trim() : me.handle;

    return ListView(
      padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
      children: [
        _ProfileShellCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.surfaceElevated,
                    backgroundImage:
                        me.avatarUrl != null && me.avatarUrl!.isNotEmpty ? NetworkImage(me.avatarUrl!) : null,
                    child: me.avatarUrl == null || me.avatarUrl!.isEmpty
                        ? const Icon(Icons.person_rounded, size: 36, color: AppColors.textSecondary)
                        : null,
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          displayName,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                letterSpacing: -0.5,
                              ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '@${me.handle}',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textTertiary),
                        ),
                        if (me.bio != null && me.bio!.trim().isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            me.bio!,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                  height: 1.45,
                                ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              _StatStrip(
                stats: [
                  _StatData('Posts', '${me.counts.posts}'),
                  _StatData('Followers', '${me.counts.followers}'),
                  _StatData('Following', '${me.counts.following}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _ActionRow(
          children: [
            OutlinedButton.icon(
              onPressed: () => context.push(AppRoutes.home),
              icon: const Icon(Icons.dynamic_feed_rounded, size: 18),
              label: const Text('Carmunity feed'),
            ),
            OutlinedButton.icon(
              onPressed: () => context.push(AppRoutes.devSession),
              icon: const Icon(Icons.developer_mode_outlined, size: 18),
              label: const Text('Session'),
            ),
            OutlinedButton.icon(
              onPressed: () => context.push(AppRoutes.savedAuctions),
              icon: const Icon(Icons.star_outline_rounded, size: 18),
              label: const Text('Saved'),
            ),
            OutlinedButton.icon(
              onPressed: () => context.push(AppRoutes.settings),
              icon: const Icon(Icons.settings_outlined, size: 18),
              label: const Text('Settings'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        _SectionLabel(
          context,
          'Garage',
          me.counts.garageCars == 0
              ? 'Add cars on the website to show them in-app.'
              : '${me.counts.garageCars} car${me.counts.garageCars == 1 ? '' : 's'} on your profile',
        ),
        const SizedBox(height: AppSpacing.sm),
        _GarageShowcaseCard(
          count: me.counts.garageCars,
          subtitle: 'Image-first collection — same data as the web garage.',
          onOpen: () => context.push(AppRoutes.garage),
        ),
        const SizedBox(height: AppSpacing.xl),
        _SectionLabel(context, 'Posts', 'Recent Carmunity posts'),
        const SizedBox(height: AppSpacing.sm),
        if (me.recentPosts.isEmpty)
          const _EmptyPostHint()
        else
          ...me.recentPosts.map((p) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: ProfilePostPreviewTile(post: p),
              )),
      ],
    );
  }
}

class _ProfileShellCard extends StatelessWidget {
  const _ProfileShellCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceCard.withOpacity(0.92),
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      clipBehavior: Clip.antiAlias,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(color: AppColors.borderSubtle.withOpacity(0.9)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: child,
        ),
      ),
    );
  }
}

class _StatData {
  const _StatData(this.label, this.value);
  final String label;
  final String value;
}

class _StatStrip extends StatelessWidget {
  const _StatStrip({required this.stats});

  final List<_StatData> stats;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.borderSubtle.withOpacity(0.85)),
        color: AppColors.surfaceElevated.withOpacity(0.35),
      ),
      child: Row(
        children: [
          for (var i = 0; i < stats.length; i++) ...[
            if (i > 0)
              Container(width: 1, height: 40, color: AppColors.borderSubtle.withOpacity(0.7)),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Column(
                  children: [
                    Text(
                      stats[i].value,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      stats[i].label.toUpperCase(),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: AppColors.textTertiary,
                        letterSpacing: 0.6,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: children,
    );
  }
}

Widget _SectionLabel(BuildContext context, String title, String subtitle) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
      ),
      const SizedBox(height: 2),
      Text(
        subtitle,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
      ),
    ],
  );
}

class _GarageShowcaseCard extends StatelessWidget {
  const _GarageShowcaseCard({
    required this.count,
    required this.subtitle,
    required this.onOpen,
  });

  final int count;
  final String subtitle;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: AppColors.surfaceCard.withOpacity(0.92),
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpen,
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            border: Border.all(color: AppColors.borderSubtle.withOpacity(0.9)),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.accent.withOpacity(0.08),
                Colors.transparent,
              ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                Container(
                  height: 72,
                  width: 72,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    color: AppColors.surfaceElevated,
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: const Icon(Icons.directions_car_filled_rounded, color: AppColors.accent, size: 36),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Garage', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(subtitle, style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '$count vehicle${count == 1 ? '' : 's'} on file',
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
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
    );
  }
}

class _ProfileErrorBody extends StatelessWidget {
  const _ProfileErrorBody({required this.message, required this.onRetry});

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
            Text('Could not load profile', style: Theme.of(context).textTheme.titleMedium),
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

class _ProfileMissingSessionBody extends StatelessWidget {
  const _ProfileMissingSessionBody({required this.onClear});

  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.key_off_outlined, size: 48, color: AppColors.textTertiary),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Session could not be verified',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Clear the in-app session and sign in again (demo seller or Developer session).',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onClear, child: const Text('Clear session')),
          ],
        ),
      ),
    );
  }
}

class _EmptyPostHint extends StatelessWidget {
  const _EmptyPostHint();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withOpacity(0.4),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.borderSubtle.withOpacity(0.9)),
      ),
      child: Text(
        'No posts to show yet.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
        textAlign: TextAlign.center,
      ),
    );
  }
}
