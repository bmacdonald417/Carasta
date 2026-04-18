import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/auction_formatting.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../dto/auction_filter_state.dart';
import '../dto/auction_list_item_dto.dart';
import 'auction_filter_sheet.dart';

class AuctionsScreen extends ConsumerStatefulWidget {
  const AuctionsScreen({super.key});

  @override
  ConsumerState<AuctionsScreen> createState() => _AuctionsScreenState();
}

class _AuctionsScreenState extends ConsumerState<AuctionsScreen> {
  final List<AuctionListItemDto> _items = [];
  int _page = 1;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  bool _truncated = false;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(_reloadFromFilter);
  }

  Future<void> _reloadFromFilter() async {
    final filter = ref.read(auctionFilterProvider);
    setState(() {
      _loading = true;
      _error = null;
      _items.clear();
      _page = 1;
      _truncated = false;
      _total = 0;
    });
    try {
      final page = await ref.read(auctionRepositoryProvider).searchAuctions(filter, page: 1);
      if (!mounted) return;
      setState(() {
        _items.addAll(page.results);
        _total = page.pagination.total;
        _truncated = page.pagination.highBidSortTruncated == true;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e is ApiException ? e.message : e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || _loading) return;
    final filter = ref.read(auctionFilterProvider);
    final nextPage = _page + 1;
    if ((nextPage - 1) * filter.pageSize >= _total) return;

    setState(() => _loadingMore = true);
    try {
      final page = await ref.read(auctionRepositoryProvider).searchAuctions(filter, page: nextPage);
      if (!mounted) return;
      setState(() {
        _items.addAll(page.results);
        _page = nextPage;
        _truncated = page.pagination.highBidSortTruncated == true;
        _loadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingMore = false);
    }
  }

  Future<void> _openFilters() async {
    final current = ref.read(auctionFilterProvider);
    final next = await AuctionFilterSheet.show(context, current);
    if (next != null && mounted) {
      ref.read(auctionFilterProvider.notifier).state = next;
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuctionFilterState>(auctionFilterProvider, (previous, next) {
      if (previous != null && previous != next) {
        _reloadFromFilter();
      }
    });

    final filter = ref.watch(auctionFilterProvider);
    final h = pageHorizontalPadding(context);
    final watchedIds = ref.watch(auctionWatchedIdsProvider).maybeWhen(
          data: (s) => s,
          orElse: () => <String>{},
        );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Auctions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            tooltip: 'Filters',
            onPressed: _loading ? null : _openFilters,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _reloadFromFilter,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.sm),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Discover listings',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Car-focused marketplace browse. Bidding and buy-now stay on Carasta web for now.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Wrap(
                      spacing: AppSpacing.xs,
                      runSpacing: AppSpacing.xs,
                      children: [
                        Chip(
                          avatar: const Icon(Icons.sort_rounded, size: 18),
                          label: Text(filter.sort.label),
                          visualDensity: VisualDensity.compact,
                          backgroundColor: AppColors.surfaceElevated,
                        ),
                        if (filter.noReserve)
                          const Chip(
                            label: Text('No reserve'),
                            visualDensity: VisualDensity.compact,
                          ),
                        if (filter.endingSoon)
                          const Chip(
                            label: Text('Ending soon'),
                            visualDensity: VisualDensity.compact,
                          ),
                      ],
                    ),
                    if (_truncated) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'Highest-bid sort is approximate for large result sets — try narrowing filters.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.accentMuted),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (_loading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: AppSpacing.md),
                        FilledButton(onPressed: _reloadFromFilter, child: const Text('Retry')),
                      ],
                    ),
                  ),
                ),
              )
            else if (_items.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Text(
                      'No auctions match these filters.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ),
              )
            else
              SliverLayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.crossAxisExtent > 720;
                  if (wide) {
                    return SliverPadding(
                      padding: EdgeInsets.fromLTRB(h, 0, h, AppSpacing.sm),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: AppSpacing.md,
                          crossAxisSpacing: AppSpacing.md,
                          childAspectRatio: 0.72,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final a = _items[index];
                            return _AuctionCard(
                              item: a,
                              isSaved: watchedIds.contains(a.id),
                              onTap: () => context.push(AppRoutes.auctionDetail(a.id)),
                            );
                          },
                          childCount: _items.length,
                        ),
                      ),
                    );
                  }
                  return SliverPadding(
                    padding: EdgeInsets.fromLTRB(h, 0, h, AppSpacing.sm),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final a = _items[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.md),
                            child: _AuctionCard(
                              item: a,
                              isSaved: watchedIds.contains(a.id),
                              onTap: () => context.push(AppRoutes.auctionDetail(a.id)),
                            ),
                          );
                        },
                        childCount: _items.length,
                      ),
                    ),
                  );
                },
              ),
            if (!_loading && _error == null && _items.isNotEmpty && _hasMore(filter))
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
                  child: Center(
                    child: _loadingMore
                        ? const Padding(
                            padding: EdgeInsets.all(AppSpacing.lg),
                            child: CircularProgressIndicator(),
                          )
                        : TextButton.icon(
                            onPressed: _loadMore,
                            icon: const Icon(Icons.expand_more_rounded),
                            label: const Text('Load more'),
                          ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  bool _hasMore(AuctionFilterState filter) {
    return _page * filter.pageSize < _total;
  }
}

class _AuctionCard extends StatelessWidget {
  const _AuctionCard({required this.item, required this.onTap, this.isSaved = false});

  final AuctionListItemDto item;
  final VoidCallback onTap;
  final bool isSaved;

  @override
  Widget build(BuildContext context) {
    final imageUrl = item.images.isNotEmpty ? item.images.first.url : null;
    final headline = '${item.year} ${item.make} ${item.model}'.trim();
    final seller = item.seller.handle != null ? '@${item.seller.handle}' : 'Seller';

    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    imageUrl != null && imageUrl.isNotEmpty
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: AppColors.imagePlaceholder,
                              child: const Icon(Icons.directions_car_filled, color: AppColors.textTertiary, size: 40),
                            ),
                          )
                        : Container(
                            color: AppColors.imagePlaceholder,
                            alignment: Alignment.center,
                            child: const Icon(Icons.directions_car_filled, color: AppColors.textTertiary, size: 40),
                          ),
                    if (isSaved)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: AppColors.scrim,
                            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                          ),
                          child: const Padding(
                            padding: EdgeInsets.all(6),
                            child: Icon(Icons.star_rounded, color: AppColors.accent, size: 20),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
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
                      headline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      formatAuctionBidLine(item.highBidCents, item.bidCount),
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.accent),
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Row(
                      children: [
                        const Icon(Icons.schedule_rounded, size: 14, color: AppColors.textTertiary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            formatAuctionEndUrgency(item.endAt),
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (item.locationZip != null && item.locationZip!.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        'ZIP ${item.locationZip}',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      seller,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textSecondary),
                    ),
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
