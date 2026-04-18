import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../forums/dto/forum_space_dto.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../../../shared/state/providers.dart';

/// Create forum thread — `POST /api/forums/threads`.
/// Optional query: `?categoryId=` (e.g. from category thread list).
class CreateForumThreadScreen extends ConsumerStatefulWidget {
  const CreateForumThreadScreen({super.key});

  @override
  ConsumerState<CreateForumThreadScreen> createState() => _CreateForumThreadScreenState();
}

class _CreateForumThreadScreenState extends ConsumerState<CreateForumThreadScreen> {
  final _titleCtrl = TextEditingController();
  final _bodyCtrl = TextEditingController();
  String? _selectedSpaceSlug;
  String? _selectedCategoryId;
  bool _submitting = false;
  bool _lockedCategoryFromQuery = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final q = GoRouterState.of(context).uri.queryParameters['categoryId'];
      if (q != null && q.isNotEmpty) {
        setState(() {
          _selectedCategoryId = q;
          _lockedCategoryFromQuery = true;
        });
      }
    });
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in required. Use Developer session on the You tab.')),
      );
      return;
    }
    final cat = _selectedCategoryId?.trim();
    if (cat == null || cat.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choose a forum category.')),
      );
      return;
    }
    final title = _titleCtrl.text.trim();
    final body = _bodyCtrl.text.trim();
    if (title.isEmpty || body.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and body are required.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final id = await ref.read(forumRepositoryProvider).createThread(
            categoryId: cat,
            title: title,
            body: body,
          );
      ref.invalidate(forumSpacesProvider);
      if (_selectedSpaceSlug != null) {
        ref.invalidate(forumSpaceDetailProvider(_selectedSpaceSlug!));
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thread created')));
      context.go(AppRoutes.forumThread(id));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);
    final spacesAsync = ref.watch(forumSpacesProvider);
    final h = pageHorizontalPadding(context);

    final detailAsync =
        _selectedSpaceSlug != null ? ref.watch(forumSpaceDetailProvider(_selectedSpaceSlug!)) : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('New forum thread'),
        actions: [
          TextButton(
            onPressed: (_submitting || !auth.canPerformMutations) ? null : _submit,
            child: _submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Post'),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
        children: [
          if (!auth.canPerformMutations) const SignInRequiredHint(),
          Text(
            'Forum threads are separate from the main feed. Pick a space and category, then write for the community.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (_lockedCategoryFromQuery)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.place_outlined, color: AppColors.accent, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Category pre-selected from the thread list.',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          spacesAsync.when(
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text(e.toString()),
            data: (spaces) {
              if (_lockedCategoryFromQuery) {
                return const SizedBox.shrink();
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  DropdownButtonFormField<String>(
                    key: ValueKey<String?>(_selectedSpaceSlug),
                    initialValue: _selectedSpaceSlug,
                    decoration: const InputDecoration(
                      labelText: 'Forum space',
                      border: OutlineInputBorder(),
                    ),
                    items: spaces
                        .map(
                          (s) => DropdownMenuItem(
                            value: s.slug,
                            child: Text(s.title),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      setState(() {
                        _selectedSpaceSlug = v;
                        _selectedCategoryId = null;
                      });
                      if (v != null) {
                        ref.invalidate(forumSpaceDetailProvider(v));
                      }
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (_selectedSpaceSlug != null)
                    detailAsync!.when(
                      loading: () => const Padding(
                        padding: EdgeInsets.all(AppSpacing.md),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                      error: (e, _) => Text(e.toString()),
                      data: (detail) => _CategoryPicker(
                        detail: detail,
                        selectedId: _selectedCategoryId,
                        onSelect: (id) => setState(() => _selectedCategoryId = id),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _titleCtrl,
            decoration: const InputDecoration(
              labelText: 'Title',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _bodyCtrl,
            minLines: 6,
            maxLines: 16,
            decoration: const InputDecoration(
              labelText: 'Body',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: (_submitting || !auth.canPerformMutations) ? null : _submit,
            child: const Text('Publish thread'),
          ),
        ],
      ),
    );
  }
}

class _CategoryPicker extends StatelessWidget {
  const _CategoryPicker({
    required this.detail,
    required this.selectedId,
    required this.onSelect,
  });

  final ForumSpaceDetailDto detail;
  final String? selectedId;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    if (detail.categories.isEmpty) {
      return Text(
        'No categories in this space.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
      );
    }
    return DropdownButtonFormField<String>(
      key: ValueKey<String?>(selectedId),
      initialValue: selectedId,
      decoration: const InputDecoration(
        labelText: 'Category',
        border: OutlineInputBorder(),
      ),
      items: detail.categories
          .map(
            (c) => DropdownMenuItem(
              value: c.id,
              child: Text(c.title),
            ),
          )
          .toList(),
      onChanged: (v) {
        if (v != null) onSelect(v);
      },
    );
  }
}
