import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import 'carmunity_demo_sign_in.dart';

/// **Provisional** — paste NextAuth session cookie + user id for local API testing.
/// Not a production sign-in flow.
class DevSessionScreen extends ConsumerStatefulWidget {
  const DevSessionScreen({super.key});

  @override
  ConsumerState<DevSessionScreen> createState() => _DevSessionScreenState();
}

class _DevSessionScreenState extends ConsumerState<DevSessionScreen> {
  late final TextEditingController _userIdCtrl;
  late final TextEditingController _cookieNameCtrl;
  late final TextEditingController _cookieValueCtrl;

  @override
  void initState() {
    super.initState();
    _userIdCtrl = TextEditingController();
    _cookieNameCtrl = TextEditingController(text: 'next-auth.session-token');
    _cookieValueCtrl = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = ref.read(authServiceProvider);
      _userIdCtrl.text = auth.userId ?? '';
    });
  }

  @override
  void dispose() {
    _userIdCtrl.dispose();
    _cookieNameCtrl.dispose();
    _cookieValueCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    final auth = ref.watch(authServiceProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Developer session')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Text(
            'Provisional auth',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Copy the session cookie value from your browser after signing in on the website. '
            'Set your Carasta user id for following feed and self-follow checks.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          TextField(
            controller: _userIdCtrl,
            decoration: const InputDecoration(
              labelText: 'User id (DEV_USER_ID)',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _cookieNameCtrl,
            decoration: const InputDecoration(
              labelText: 'Cookie name',
              hintText: 'next-auth.session-token',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _cookieValueCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Cookie value',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Status: ${auth.canPerformMutations ? "session cookie or bearer set" : "no mutation session"} · '
            'user id: ${auth.hasUserId ? "set" : "missing"}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: AppSpacing.lg),
          FilledButton(
            onPressed: () {
              ref.read(authServiceProvider).applyDevSessionFields(
                    userIdInput: _userIdCtrl.text,
                    cookieName: _cookieNameCtrl.text,
                    cookieValueInput: _cookieValueCtrl.text,
                  );
              ref.invalidate(carmunityMeProvider);
              ref.invalidate(homeFeedProvider);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Session applied (memory only).')),
              );
            },
            child: const Text('Apply'),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton(
            onPressed: () {
              ref.read(authServiceProvider).clearSession();
              _cookieValueCtrl.clear();
              ref.invalidate(carmunityMeProvider);
              ref.invalidate(homeFeedProvider);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cleared in-app session.')),
              );
            },
            child: const Text('Clear in-app session'),
          ),
          if (showCarmunityDemoSignInUi()) ...[
            const SizedBox(height: AppSpacing.xl),
            Text(
              'Or pick a seeded seller',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton.icon(
              onPressed: () => showCarmunityDemoSignInSheet(context, ref),
              icon: const Icon(Icons.people_outline),
              label: const Text('Demo seller list'),
            ),
          ],
        ],
      ),
    );
  }
}
