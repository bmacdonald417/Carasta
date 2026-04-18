import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/auction_formatting.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../dto/auction_detail_dto.dart';
import '../dto/auction_image_dto.dart';
import '../dto/auction_seller_dto.dart';

/// Read-only auction detail — discovery / consumption. Bid & buy on web (Phase 7+).
class AuctionDetailScreen extends ConsumerStatefulWidget {
  const AuctionDetailScreen({super.key, required this.auctionId});

  final String auctionId;

  @override
  ConsumerState<AuctionDetailScreen> createState() => _AuctionDetailScreenState();
}

class _AuctionDetailScreenState extends ConsumerState<AuctionDetailScreen> {
  AuctionDetailDto? _auction;
  bool _loading = true;
  bool _watchBusy = false;
  String? _error;
  final _pageCtrl = PageController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final a = await ref.read(auctionRepositoryProvider).getAuctionDetail(widget.auctionId);
      if (!mounted) return;
      setState(() {
        _auction = a;
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

  Future<void> _toggleWatch() async {
    final a = _auction;
    if (a == null || _watchBusy) return;
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in required. Use email sign-in or Developer session.')),
      );
      return;
    }
    setState(() => _watchBusy = true);
    final wasWatching = a.watching;
    try {
      final repo = ref.read(auctionRepositoryProvider);
      if (wasWatching) {
        await repo.unwatchAuction(a.id);
      } else {
        await repo.watchAuction(a.id);
      }
      ref.invalidate(auctionWatchedIdsProvider);
      ref.invalidate(auctionWatchlistProvider);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(wasWatching ? 'Removed from saved auctions' : 'Saved to your list')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : e.toString())),
      );
    } finally {
      if (mounted) setState(() => _watchBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    final maxW = AppSpacing.contentMaxWidth;

    return Scaffold(
      appBar: AppBar(
        title: Text(_auction?.title ?? 'Auction'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: AppSpacing.md),
                        FilledButton(onPressed: _load, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : _auction == null
                  ? const SizedBox.shrink()
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: maxW),
                            child: _DetailBody(
                              auction: _auction!,
                              pageController: _pageCtrl,
                              canMutate: ref.watch(authServiceProvider).canPerformMutations,
                              watchBusy: _watchBusy,
                              onToggleWatch: _toggleWatch,
                            ),
                          ),
                        ),
                      ),
                    ),
    );
  }
}

class _DetailBody extends StatelessWidget {
  const _DetailBody({
    required this.auction,
    required this.pageController,
    required this.canMutate,
    required this.watchBusy,
    required this.onToggleWatch,
  });

  final AuctionDetailDto auction;
  final PageController pageController;
  final bool canMutate;
  final bool watchBusy;
  final VoidCallback onToggleWatch;

  @override
  Widget build(BuildContext context) {
    final images = auction.images;
    final headline = '${auction.year} ${auction.make} ${auction.model}'.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (images.isEmpty)
          AspectRatio(
            aspectRatio: 16 / 10,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.imagePlaceholder,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
              child: const Icon(Icons.directions_car_filled, size: 56, color: AppColors.textTertiary),
            ),
          )
        else
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: AspectRatio(
              aspectRatio: 16 / 10,
              child: PageView.builder(
                controller: pageController,
                itemCount: images.length,
                itemBuilder: (context, i) => _GalleryImage(image: images[i]),
              ),
            ),
          ),
        if (images.length > 1) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${images.length} photos · swipe',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
          ),
        ],
        const SizedBox(height: AppSpacing.lg),
        Text(auction.title, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: AppSpacing.xs),
        Text(
          headline,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.md),
        _MetaRow(
          icon: Icons.gavel_rounded,
          label: formatAuctionBidLine(auction.highBidCents, auction.bidCount),
          emphasize: true,
        ),
        if (auction.highBidderHandle != null && auction.highBidderHandle!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xs),
            child: Text(
              'High bidder @${auction.highBidderHandle}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
            ),
          ),
        const SizedBox(height: AppSpacing.sm),
        _MetaRow(
          icon: Icons.schedule_rounded,
          label: 'Ends ${formatAuctionDateTime(auction.endAt)} · ${formatAuctionEndUrgency(auction.endAt)}',
        ),
        if (auction.reservePriceCents != null) ...[
          const SizedBox(height: AppSpacing.xs),
          _MetaRow(
            icon: Icons.flag_outlined,
            label: 'Reserve ${formatAuctionUsdFromCents(auction.reservePriceCents!)}',
          ),
        ],
        if (auction.reserveMeterPercent != null && auction.reservePriceCents != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Reserve progress',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
          ),
          const SizedBox(height: AppSpacing.xs),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: (auction.reserveMeterPercent!.clamp(0, 100)) / 100.0,
              backgroundColor: AppColors.surfaceElevated,
              color: AppColors.accent,
            ),
          ),
        ],
        if (auction.buyNowPriceCents != null) ...[
          const SizedBox(height: AppSpacing.sm),
          _MetaRow(
            icon: Icons.flash_on_rounded,
            label:
                'Buy now ${formatAuctionUsdFromCents(auction.buyNowPriceCents!)}${auction.buyNowExpiresAt != null ? ' · expires ${formatAuctionDateTime(auction.buyNowExpiresAt!)}' : ''}',
          ),
        ],
        if (auction.mileage != null)
          _MetaRow(icon: Icons.speed_rounded, label: '${auction.mileage!.toString()} mi'),
        if (auction.conditionGrade != null)
          _MetaRow(
            icon: Icons.verified_outlined,
            label: formatConditionGrade(auction.conditionGrade),
          ),
        if (auction.locationZip != null && auction.locationZip!.isNotEmpty)
          _MetaRow(icon: Icons.place_outlined, label: 'ZIP ${auction.locationZip}'),
        const SizedBox(height: AppSpacing.lg),
        _SellerCard(seller: auction.seller),
        if (auction.description != null && auction.description!.trim().isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          Text('Description', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          Text(
            auction.description!.trim(),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.4),
          ),
        ],
        if (auction.conditionSummary != null && auction.conditionSummary!.trim().isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          Text('Condition', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          Text(
            auction.conditionSummary!.trim(),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.4),
          ),
        ],
        const SizedBox(height: AppSpacing.xl),
        Text(
          'Actions',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        const SizedBox(height: AppSpacing.sm),
        if (!canMutate) ...[
          const SignInRequiredHint(),
          const SizedBox(height: AppSpacing.sm),
        ],
        auction.watching
            ? FilledButton.tonalIcon(
                onPressed: (!canMutate || watchBusy) ? null : onToggleWatch,
                icon: watchBusy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.star_rounded),
                label: const Text('Saved — tap to remove'),
              )
            : OutlinedButton.icon(
                onPressed: (!canMutate || watchBusy) ? null : onToggleWatch,
                icon: watchBusy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.star_outline_rounded),
                label: const Text('Save auction'),
              ),
        const SizedBox(height: AppSpacing.sm),
        Tooltip(
          message: 'Place bids and use buy-now on the Carasta website.',
          child: FilledButton.icon(
            onPressed: null,
            icon: const Icon(Icons.open_in_browser_rounded),
            label: const Text('Bid or buy on Carasta web'),
          ),
        ),
      ],
    );
  }
}

class _GalleryImage extends StatelessWidget {
  const _GalleryImage({required this.image});

  final AuctionImageDto image;

  @override
  Widget build(BuildContext context) {
    return Image.network(
      image.url,
      fit: BoxFit.cover,
      width: double.infinity,
      errorBuilder: (_, __, ___) => Container(
        color: AppColors.imagePlaceholder,
        alignment: Alignment.center,
        child: const Icon(Icons.broken_image_outlined, color: AppColors.textTertiary, size: 48),
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  const _MetaRow({
    required this.icon,
    required this.label,
    this.emphasize = false,
  });

  final IconData icon;
  final String label;
  final bool emphasize;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: emphasize ? AppColors.accent : AppColors.textTertiary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              label,
              style: emphasize
                  ? Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.accent)
                  : Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _SellerCard extends StatelessWidget {
  const _SellerCard({required this.seller});

  final AuctionSellerDetailDto seller;

  @override
  Widget build(BuildContext context) {
    final handle = seller.handle;
    final name = seller.name;
    final avatarUrl = seller.avatarUrl;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.surfaceElevated,
            backgroundImage: avatarUrl != null && avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
            child: avatarUrl == null || avatarUrl.isEmpty
                ? Text(
                    handle.isNotEmpty ? handle[0].toUpperCase() : '?',
                    style: Theme.of(context).textTheme.titleMedium,
                  )
                : null,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Seller', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary)),
                Text(name?.trim().isNotEmpty == true ? name!.trim() : '@$handle', style: Theme.of(context).textTheme.titleSmall),
                Text('@$handle', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
