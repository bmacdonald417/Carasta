import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/auction_formatting.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../dto/auction_watch_summary_dto.dart';

/// Lightweight saved list — `GET /api/carmunity/watchlist`.
class SavedAuctionsScreen extends ConsumerWidget {
  const SavedAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authServiceProvider);
    final h = pageHorizontalPadding(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Saved auctions')),
      body: !auth.canPerformMutations
          ? ListView(
              padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
              children: const [
                SignInRequiredHint(),
                SizedBox(height: AppSpacing.md),
                Text(
                  'Sign in with email or Developer session to see auctions you have saved.',
                ),
              ],
            )
          : ref.watch(auctionWatchlistProvider).when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(e.toString(), textAlign: TextAlign.center),
                        const SizedBox(height: AppSpacing.md),
                        FilledButton(
                          onPressed: () => ref.invalidate(auctionWatchlistProvider),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (items) {
                  if (items.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Text(
                          'No saved auctions yet. Save from a listing detail.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
                        ),
                      ),
                    );
                  }
                  return ListView.separated(
                    padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, i) => _SavedRow(item: items[i]),
                  );
                },
              ),
    );
  }
}

class _SavedRow extends StatelessWidget {
  const _SavedRow({required this.item});

  final AuctionWatchSummaryDto item;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: () => context.push(AppRoutes.auctionDetail(item.id)),
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
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  child: SizedBox(
                    width: 88,
                    height: 64,
                    child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                        ? Image.network(
                            item.imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(color: AppColors.imagePlaceholder),
                          )
                        : Container(
                            color: AppColors.imagePlaceholder,
                            child: const Icon(Icons.directions_car_filled, color: AppColors.textTertiary),
                          ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        '${item.status} · ends ${formatAuctionDateTime(item.endAt)}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
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
