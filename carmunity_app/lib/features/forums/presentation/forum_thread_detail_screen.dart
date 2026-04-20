import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/forum_formatting.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../../../shared/state/providers.dart';
import '../dto/forum_reply_dto.dart';
import '../dto/forum_thread_detail_dto.dart';

/// Thread detail + replies + reply composer.
class ForumThreadDetailScreen extends ConsumerStatefulWidget {
  const ForumThreadDetailScreen({super.key, required this.threadId});

  final String threadId;

  @override
  ConsumerState<ForumThreadDetailScreen> createState() => _ForumThreadDetailScreenState();
}

class _ForumThreadDetailScreenState extends ConsumerState<ForumThreadDetailScreen> {
  ForumThreadDetailDto? _thread;
  bool _loading = true;
  String? _error;
  final _replyCtrl = TextEditingController();
  bool _replying = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _replyCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final t = await ref.read(forumRepositoryProvider).getThreadDetail(widget.threadId);
      if (!mounted) return;
      setState(() {
        _thread = t;
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

  Future<void> _submitReply() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in required. Use Developer session on the You tab.')),
      );
      return;
    }
    final text = _replyCtrl.text.trim();
    if (text.isEmpty) return;
    if (_thread?.locked == true) return;

    setState(() => _replying = true);
    try {
      await ref.read(forumRepositoryProvider).createReply(threadId: widget.threadId, body: text);
      _replyCtrl.clear();
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reply posted')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : e.toString())),
      );
    } finally {
      if (mounted) setState(() => _replying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);
    final h = pageHorizontalPadding(context);
    final maxW = AppSpacing.contentMaxWidth;

    return Scaffold(
      appBar: AppBar(
        title: Text(_thread?.title ?? 'Thread'),
        actions: [
          if (_thread != null)
            TextButton(
              onPressed: () => context.push(AppRoutes.forumSpace(_thread!.category.space.slug)),
              child: const Text('Space'),
            ),
        ],
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
              : _thread == null
                  ? const SizedBox.shrink()
                  : Column(
                      children: [
                        Expanded(
                          child: RefreshIndicator(
                            onRefresh: _load,
                            child: SingleChildScrollView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.lg),
                              child: Center(
                                child: ConstrainedBox(
                                  constraints: BoxConstraints(maxWidth: maxW),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      Text(
                                        _thread!.title,
                                        style: Theme.of(context).textTheme.titleLarge,
                                      ),
                                      const SizedBox(height: AppSpacing.sm),
                                      Text(
                                        '@${_thread!.author.handle} · ${formatForumDateTime(_thread!.createdAt)}',
                                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
                                      ),
                                      const SizedBox(height: AppSpacing.md),
                                      Text(
                                        _thread!.body,
                                        style: Theme.of(context).textTheme.bodyLarge,
                                      ),
                                      const SizedBox(height: AppSpacing.xl),
                                      Text(
                                        'Replies (${_thread!.replies.length})',
                                        style: Theme.of(context).textTheme.titleSmall,
                                      ),
                                      const SizedBox(height: AppSpacing.sm),
                                      if (_thread!.replies.isEmpty)
                                        Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.all(AppSpacing.lg),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceCard.withOpacity(0.65),
                                            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                                            border: Border.all(color: AppColors.accent.withOpacity(0.22)),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Be the first reply',
                                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                                      fontWeight: FontWeight.w600,
                                                    ),
                                              ),
                                              const SizedBox(height: AppSpacing.xs),
                                              Text(
                                                'Lead with context or a specific question. Use @handle when you want someone looped in — autocomplete lives on web; parsing stays server-side.',
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                      color: AppColors.textSecondary,
                                                      height: 1.45,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        )
                                      else
                                        ..._thread!.replies.map((r) => _ReplyBubble(reply: r)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        if (_thread!.locked)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(AppSpacing.md),
                            color: AppColors.surfaceElevated,
                            child: Text(
                              'This thread is locked.',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          )
                        else ...[
                          if (!auth.canPerformMutations) const SignInRequiredHint(),
                          Material(
                            color: AppColors.surface,
                            elevation: 8,
                            child: Padding(
                              padding: EdgeInsets.fromLTRB(h, AppSpacing.sm, h, AppSpacing.md),
                              child: Center(
                                child: ConstrainedBox(
                                  constraints: BoxConstraints(maxWidth: maxW),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          controller: _replyCtrl,
                                          minLines: 1,
                                          maxLines: 5,
                                          enabled: auth.canPerformMutations && !_replying,
                                          textInputAction: TextInputAction.newline,
                                          decoration: InputDecoration(
                                            hintText: 'Write a reply… (@mentions supported on web)',
                                            filled: true,
                                            fillColor: AppColors.surfaceCard.withOpacity(0.85),
                                            contentPadding: const EdgeInsets.symmetric(
                                              horizontal: AppSpacing.md,
                                              vertical: AppSpacing.sm,
                                            ),
                                            border: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                                              borderSide: BorderSide(color: AppColors.borderSubtle),
                                            ),
                                            enabledBorder: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                                              borderSide: BorderSide(color: AppColors.borderSubtle),
                                            ),
                                            focusedBorder: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                                              borderSide: BorderSide(color: AppColors.accent.withOpacity(0.55)),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: AppSpacing.sm),
                                      FilledButton(
                                        onPressed: (_replying || !auth.canPerformMutations) ? null : _submitReply,
                                        child: _replying
                                            ? const SizedBox(
                                                width: 20,
                                                height: 20,
                                                child: CircularProgressIndicator(strokeWidth: 2),
                                              )
                                            : const Text('Send'),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
    );
  }
}

class _ReplyBubble extends StatelessWidget {
  const _ReplyBubble({required this.reply});

  final ForumReplyDto reply;

  @override
  Widget build(BuildContext context) {
    final body = reply.body;
    final handle = reply.author.handle;
    final created = reply.createdAt;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '@$handle · ${formatForumRelative(created)}',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(body, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}
