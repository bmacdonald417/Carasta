import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../core/utils/url_normalization.dart';
import '../../../shared/models/shared_link_draft.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../../../shared/state/providers.dart';

/// Share an external link as a Carmunity post. Backend stores plain [Post.content] only (no OG preview yet).
class ShareLinkPostScreen extends ConsumerStatefulWidget {
  const ShareLinkPostScreen({super.key});

  @override
  ConsumerState<ShareLinkPostScreen> createState() => _ShareLinkPostScreenState();
}

class _ShareLinkPostScreenState extends ConsumerState<ShareLinkPostScreen> {
  final _urlCtrl = TextEditingController();
  final _captionCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _urlCtrl.dispose();
    _captionCtrl.dispose();
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

    final normalized = normalizeHttpUrl(_urlCtrl.text);
    if (normalized == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid http(s) URL.')),
      );
      return;
    }

    final draft = SharedLinkDraft(
      normalizedUrl: normalized,
      caption: _captionCtrl.text.trim().isEmpty ? null : _captionCtrl.text.trim(),
    );
    final body = draft.toPostContent();

    setState(() => _submitting = true);
    try {
      final id = await ref.read(carmunityRepositoryProvider).createPost(content: body);
      ref.invalidate(homeFeedProvider);
      ref.invalidate(carmunityMeProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Link posted')),
      );
      context.go(AppRoutes.postDetail(id));
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
    final h = pageHorizontalPadding(context);
    final canPost = auth.canPerformMutations && !_submitting;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Share link'),
        actions: [
          TextButton(
            onPressed: canPost ? _submit : null,
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
            'Link preview cards are not generated server-side yet. Your post will show the URL as text in the feed.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          TextField(
            controller: _urlCtrl,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
              labelText: 'URL',
              hintText: 'https://example.com/article',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _captionCtrl,
            minLines: 2,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Optional caption',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: canPost ? _submit : null,
            child: _submitting
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                  )
                : const Text('Publish link'),
          ),
        ],
      ),
    );
  }
}
