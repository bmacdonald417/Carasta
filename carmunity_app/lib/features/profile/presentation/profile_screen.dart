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

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('You'),
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
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.surfaceElevated,
              child: Icon(Icons.person_rounded, size: 40, color: AppColors.textSecondary),
            ),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Your profile', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: AppSpacing.xxs),
                  Text('@handle', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Sign in to load your Carasta profile, garage, and posts.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        if (showCarmunityDemoSignInUi()) ...[
          const SizedBox(height: AppSpacing.lg),
          FilledButton.tonal(
            onPressed: () => showCarmunityDemoSignInSheet(context, ref),
            child: const Text('Sign in as demo seller'),
          ),
        ],
        const SizedBox(height: AppSpacing.lg),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.developer_mode_outlined, color: AppColors.accent),
          title: const Text('Developer session'),
          subtitle: const Text('Paste cookie + user id, or use demo seller above'),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
          onTap: () => context.push(AppRoutes.devSession),
        ),
        const Divider(height: AppSpacing.xl),
        Row(
          children: const [
            Expanded(child: _StatTile(label: 'Posts', value: '—')),
            SizedBox(width: AppSpacing.sm),
            Expanded(child: _StatTile(label: 'Followers', value: '—')),
            SizedBox(width: AppSpacing.sm),
            Expanded(child: _StatTile(label: 'Following', value: '—')),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        Text('Garage', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: AppSpacing.sm),
        _GaragePreview(
          onOpen: () => context.push(AppRoutes.garage),
          subtitle: 'Dream cars and owned rides — highlighted on cards in the feed.',
        ),
        const SizedBox(height: AppSpacing.xl),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Posts', style: Theme.of(context).textTheme.titleSmall),
            TextButton(onPressed: null, child: const Text('View all')),
          ],
        ),
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
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.surfaceElevated,
              backgroundImage:
                  me.avatarUrl != null && me.avatarUrl!.isNotEmpty ? NetworkImage(me.avatarUrl!) : null,
              child: me.avatarUrl == null || me.avatarUrl!.isEmpty
                  ? const Icon(Icons.person_rounded, size: 40, color: AppColors.textSecondary)
                  : null,
            ),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(displayName, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: AppSpacing.xxs),
                  Text('@${me.handle}', style: Theme.of(context).textTheme.bodyMedium),
                  if (me.bio != null && me.bio!.trim().isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(me.bio!, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.developer_mode_outlined, color: AppColors.accent),
          title: const Text('Developer session'),
          subtitle: const Text('Adjust cookie or user id'),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
          onTap: () => context.push(AppRoutes.devSession),
        ),
        const Divider(height: AppSpacing.xl),
        Row(
          children: [
            Expanded(
              child: _StatTile(label: 'Posts', value: '${me.counts.posts}'),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _StatTile(label: 'Followers', value: '${me.counts.followers}'),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _StatTile(label: 'Following', value: '${me.counts.following}'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.star_outline_rounded, color: AppColors.accent),
          title: const Text('Saved auctions'),
          subtitle: const Text('Listings you saved from Auctions'),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
          onTap: () => context.push(AppRoutes.savedAuctions),
        ),
        const Divider(height: AppSpacing.xl),
        Text('Garage', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: AppSpacing.sm),
        _GaragePreview(
          onOpen: () => context.push(AppRoutes.garage),
          subtitle: me.counts.garageCars == 0
              ? 'Add cars on the website to show them here.'
              : '${me.counts.garageCars} car${me.counts.garageCars == 1 ? '' : 's'} in your garage',
        ),
        const SizedBox(height: AppSpacing.xl),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Posts', style: Theme.of(context).textTheme.titleSmall),
            TextButton(
              onPressed: me.recentPosts.isEmpty
                  ? null
                  : () {
                      /* Future: profile posts route */
                    },
              child: const Text('View all'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (me.recentPosts.isEmpty)
          const _EmptyPostHint()
        else
          _RecentPostsGrid(posts: me.recentPosts),
      ],
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

class _RecentPostsGrid extends StatelessWidget {
  const _RecentPostsGrid({required this.posts});

  final List<CarmunityRecentPostDto> posts;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: AppSpacing.xs,
        crossAxisSpacing: AppSpacing.xs,
        childAspectRatio: 1,
      ),
      itemCount: posts.length,
      itemBuilder: (context, index) {
        final p = posts[index];
        final url = p.imageUrl;
        return Material(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: () => context.push(AppRoutes.postDetail(p.id)),
            child: url != null && url.isNotEmpty
                ? Image.network(url, fit: BoxFit.cover)
                : Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xs),
                      child: Text(
                        (p.content ?? '').isNotEmpty ? (p.content ?? '') : 'Post',
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
          ),
        );
      },
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
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Text(
        'No posts to show yet.',
        style: Theme.of(context).textTheme.bodySmall,
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        children: [
          Text(value, style: Theme.of(context).textTheme.titleMedium),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _GaragePreview extends StatelessWidget {
  const _GaragePreview({required this.onOpen, required this.subtitle});

  final VoidCallback onOpen;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Material(
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
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                const Icon(Icons.garage_outlined, color: AppColors.accent, size: 32),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Your garage', style: Theme.of(context).textTheme.titleSmall),
                      Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
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
