import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/forum_formatting.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import '../dto/forum_thread_summary_dto.dart';

/// Thread list for a category (`GET /api/forums/categories/[id]/threads`).
class ForumCategoryThreadsScreen extends ConsumerStatefulWidget {
  const ForumCategoryThreadsScreen({super.key, required this.categoryId});

  final String categoryId;

  @override
  ConsumerState<ForumCategoryThreadsScreen> createState() => _ForumCategoryThreadsScreenState();
}

class _ForumCategoryThreadsScreenState extends ConsumerState<ForumCategoryThreadsScreen> {
  final List<ForumThreadSummaryDto> _items = [];
  String? _cursor;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _loading = true;
      _error = null;
      _items.clear();
      _cursor = null;
    });
    try {
      final page = await ref.read(forumRepositoryProvider).getCategoryThreads(
            categoryId: widget.categoryId,
            take: 20,
          );
      if (!mounted) return;
      setState(() {
        _items.addAll(page.threads);
        _cursor = page.nextCursor;
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
    if (_cursor == null || _loadingMore) return;
    setState(() => _loadingMore = true);
    try {
      final page = await ref.read(forumRepositoryProvider).getCategoryThreads(
            categoryId: widget.categoryId,
            take: 20,
            cursor: _cursor,
          );
      if (!mounted) return;
      setState(() {
        _items.addAll(page.threads);
        _cursor = page.nextCursor;
        _loadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Threads')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('${AppRoutes.createForumThread}?categoryId=${widget.categoryId}'),
        icon: const Icon(Icons.add_comment_outlined),
        label: const Text('New thread'),
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
                        FilledButton(onPressed: _loadInitial, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadInitial,
                  child: _items.isEmpty
                      ? ListView(
                          padding: EdgeInsets.fromLTRB(h, AppSpacing.xxl, h, AppSpacing.xxl),
                          children: [
                            Text(
                              'No threads yet. Start the first one.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        )
                      : NotificationListener<ScrollNotification>(
                          onNotification: (n) {
                            if (n.metrics.pixels > n.metrics.maxScrollExtent - 200) {
                              _loadMore();
                            }
                            return false;
                          },
                          child: ListView.separated(
                            padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
                            itemCount: _items.length + (_loadingMore ? 1 : 0),
                            separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.borderSubtle),
                            itemBuilder: (context, i) {
                              if (i >= _items.length) {
                                return const Padding(
                                  padding: EdgeInsets.all(AppSpacing.lg),
                                  child: Center(child: CircularProgressIndicator()),
                                );
                              }
                              final t = _items[i];
                              return ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(t.title, style: Theme.of(context).textTheme.titleSmall),
                                subtitle: Padding(
                                  padding: const EdgeInsets.only(top: AppSpacing.xs),
                                  child: Text(
                                    '@${t.author.handle} · ${t.replyCount} replies · ${formatForumRelative(t.lastActivityAt)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
                                  ),
                                ),
                                onTap: () => context.push(AppRoutes.forumThread(t.id)),
                              );
                            },
                          ),
                        ),
                ),
    );
  }
}
