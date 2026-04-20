import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/dto/notification_summary.dart';
import '../../../shared/services/push_notification_service.dart';
import '../../../shared/state/providers.dart';
import 'notification_navigation.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  final ScrollController _scroll = ScrollController();

  List<NotificationSummary> _items = const [];
  String? _cursorCreatedAt;
  String? _cursorId;
  bool _loading = true;
  bool _loadingMore = false;
  int _unread = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadInitial());
  }

  @override
  void dispose() {
    _scroll.removeListener(_onScroll);
    _scroll.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scroll.hasClients || _loadingMore) return;
    final max = _scroll.position.maxScrollExtent;
    if (max <= 0) return;
    if (_scroll.position.pixels > max - 240) {
      _loadMore();
    }
  }

  Future<void> _loadInitial() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      setState(() {
        _loading = false;
        _items = const [];
        _unread = 0;
        _error = null;
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(notificationsRepositoryProvider);
      final unread = await repo.fetchUnreadCount();
      final page = await repo.fetchPage(take: 25);
      if (!mounted) return;
      setState(() {
        _unread = unread;
        _items = page.items;
        _cursorCreatedAt = page.nextCursorCreatedAt;
        _cursorId = page.nextCursorId;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : e.toString();
      });
    }
  }

  Future<void> _loadMore() async {
    if (_cursorCreatedAt == null || _cursorId == null || _loadingMore) return;
    setState(() => _loadingMore = true);
    try {
      final repo = ref.read(notificationsRepositoryProvider);
      final page = await repo.fetchPage(
        take: 25,
        cursorCreatedAt: _cursorCreatedAt,
        cursorId: _cursorId,
      );
      if (!mounted) return;
      setState(() {
        final seen = _items.map((e) => e.id).toSet();
        for (final n in page.items) {
          if (!seen.contains(n.id)) {
            _items = [..._items, n];
            seen.add(n.id);
          }
        }
        _cursorCreatedAt = page.nextCursorCreatedAt;
        _cursorId = page.nextCursorId;
        _loadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingMore = false);
    }
  }

  Future<void> _markRead(NotificationSummary n) async {
    if (!n.isUnread) return;
    try {
      await ref.read(notificationsRepositoryProvider).markRead(n.id);
      if (!mounted) return;
      setState(() {
        _items = [
          for (final x in _items)
            if (x.id == n.id)
              NotificationSummary(
                id: x.id,
                type: x.type,
                createdAt: x.createdAt,
                readAt: DateTime.now().toUtc(),
                payload: x.payload,
              )
            else
              x,
        ];
        _unread = _unread > 0 ? _unread - 1 : 0;
      });
      ref.invalidate(notificationUnreadCountProvider);
    } catch (_) {
      /* non-blocking */
    }
  }

  Future<void> _markAllRead() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) return;
    try {
      await ref.read(notificationsRepositoryProvider).markAllRead();
      if (!mounted) return;
      setState(() {
        _unread = 0;
        _items = [
          for (final x in _items)
            NotificationSummary(
              id: x.id,
              type: x.type,
              createdAt: x.createdAt,
              readAt: x.readAt ?? DateTime.now().toUtc(),
              payload: x.payload,
            ),
        ];
      });
      ref.invalidate(notificationUnreadCountProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Could not mark all read')),
      );
    }
  }

  String _titleLine(NotificationSummary n) {
    final p = n.payload;
    final title = p['title'];
    final message = p['message'];
    if (title is String && title.trim().isNotEmpty) return title.trim();
    if (message is String && message.trim().isNotEmpty) return message.trim();
    return n.type;
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);
    final h = pageHorizontalPadding(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (auth.canPerformMutations && _unread > 0)
            TextButton(
              onPressed: () => _markAllRead(),
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadInitial,
        child: ListView(
          controller: _scroll,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.accent),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        PushNotificationService.inAppInboxExplainer,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            if (!auth.canPerformMutations) ...[
              Text(
                'Sign in to load your Carasta notification inbox (Bearer JWT or Developer session).',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
            ] else if (_loading) ...[
              const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
            ] else if (_error != null) ...[
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              TextButton(onPressed: _loadInitial, child: const Text('Retry')),
            ] else if (_items.isEmpty) ...[
              Text(
                'All caught up',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Mentions, follows, saved-thread replies, and listing alerts appear here — the same rows as carasta.com.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
            ] else ...[
              Text(
                'Unread: $_unread',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.sm),
              ..._items.map((n) => _NotificationTile(
                    item: n,
                    title: _titleLine(n),
                    onOpen: () async {
                      await _markRead(n);
                      if (!context.mounted) return;
                      await openNotificationTarget(context, n);
                    },
                  )),
              if (_loadingMore)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(child: CircularProgressIndicator()),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.item,
    required this.title,
    required this.onOpen,
  });

  final NotificationSummary item;
  final String title;
  final Future<void> Function() onOpen;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        tileColor: item.isUnread ? AppColors.surfaceElevated.withOpacity(0.35) : null,
        title: Text(title, maxLines: 3, overflow: TextOverflow.ellipsis),
        subtitle: Text(
          item.createdAt.toLocal().toString(),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
        ),
        trailing: item.isUnread ? const Icon(Icons.circle, size: 10, color: AppColors.accent) : null,
        onTap: () => onOpen(),
      ),
    );
  }
}
