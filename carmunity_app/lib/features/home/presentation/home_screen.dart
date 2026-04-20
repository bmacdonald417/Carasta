import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/dto/post_summary.dart';
import '../../../shared/state/providers.dart';
import 'widgets/feed_post_card.dart';
import 'widgets/feed_skeleton_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kind = ref.watch(homeFeedKindProvider);
    final feedAsync = ref.watch(homeFeedProvider);
    final auth = ref.watch(authServiceProvider);
    final hPad = pageHorizontalPadding(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Carmunity', style: Theme.of(context).textTheme.titleLarge),
            Text(
              'by Carasta',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textTertiary,
                  ),
            ),
          ],
        ),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final auth = ref.watch(authServiceProvider);
              final unreadAsync = ref.watch(notificationUnreadCountProvider);
              final count = unreadAsync.maybeWhen(data: (c) => c, orElse: () => 0);
              return IconButton(
                tooltip: 'Notifications — same inbox as carasta.com',
                onPressed: () {
                  ref.invalidate(notificationUnreadCountProvider);
                  context.push(AppRoutes.notifications);
                },
                icon: Badge(
                  isLabelVisible: auth.canPerformMutations && count > 0,
                  label: Text(count > 99 ? '99+' : '$count'),
                  child: const Icon(Icons.notifications_none_rounded),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(hPad, AppSpacing.sm, hPad, AppSpacing.sm),
            child: SegmentedButton<HomeFeedKind>(
              segments: const [
                ButtonSegment(value: HomeFeedKind.following, label: Text('Following')),
                ButtonSegment(value: HomeFeedKind.trending, label: Text('Trending')),
                ButtonSegment(value: HomeFeedKind.latest, label: Text('Latest')),
              ],
              selected: {kind},
              onSelectionChanged: (selection) {
                ref.read(homeFeedKindProvider.notifier).state = selection.first;
              },
            ),
          ),
          if (kind == HomeFeedKind.following && auth.userId == null)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: hPad),
              child: const _InfoBanner(
                message:
                    'Following needs your Carasta user id (DEV_USER_ID or Developer session on You). '
                    'You also need a session cookie for mutations.',
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(homeFeedProvider);
                await ref.read(homeFeedProvider.future);
              },
              child: _FeedBody(
                kind: kind,
                feedAsync: feedAsync,
                horizontalPadding: hPad,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: AppColors.accent, size: 22),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _FeedBody extends ConsumerWidget {
  const _FeedBody({
    required this.kind,
    required this.feedAsync,
    required this.horizontalPadding,
  });

  final HomeFeedKind kind;
  final AsyncValue<List<PostSummary>> feedAsync;
  final double horizontalPadding;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return feedAsync.when(
      data: (posts) {
        if (kind == HomeFeedKind.following && posts.isEmpty) {
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(
              horizontalPadding,
              AppSpacing.lg,
              horizontalPadding,
              AppSpacing.xxl,
            ),
            children: [
              Text(
                'No posts from people you follow yet.',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'When you’re signed in and follow collectors, their posts appear here.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          );
        }
        if (posts.isEmpty) {
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(
              horizontalPadding,
              AppSpacing.lg,
              horizontalPadding,
              AppSpacing.xxl,
            ),
            children: [
              Text(
                'No posts yet',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Trending pulls from your Carasta deployment. Start the web app or seed data, and set API_BASE_URL.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          );
        }
        return ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.fromLTRB(
            horizontalPadding,
            AppSpacing.sm,
            horizontalPadding,
            AppSpacing.xxl,
          ),
          itemCount: posts.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.lg),
          itemBuilder: (context, index) {
            final post = posts[index];
            return FeedPostCard(
              post: post,
              onEngagementChanged: () => ref.invalidate(homeFeedProvider),
              onTap: () async {
                await context.push(AppRoutes.postDetail(post.id));
                ref.invalidate(homeFeedProvider);
              },
            );
          },
        );
      },
      loading: () => ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.fromLTRB(
            horizontalPadding,
            AppSpacing.md,
            horizontalPadding,
            AppSpacing.xxl,
          ),
          itemCount: 3,
          separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.lg),
          itemBuilder: (_, __) => const FeedSkeletonCard(),
        ),
      error: (e, _) => ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          horizontalPadding,
          AppSpacing.lg,
          horizontalPadding,
          AppSpacing.xxl,
        ),
        children: [
          const Icon(Icons.cloud_off_outlined, size: 48, color: AppColors.textTertiary),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Couldn’t load feed',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            e is ApiException ? e.message : e.toString(),
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.tonal(
            onPressed: () => ref.invalidate(homeFeedProvider),
            child: const Text('Try again'),
          ),
        ],
      ),
    );
  }
}
